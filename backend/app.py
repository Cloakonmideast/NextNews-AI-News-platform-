from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from elevenlabs.client import ElevenLabs
import json
import os
import requests
from serpapi import GoogleSearch
from bs4 import BeautifulSoup
import warnings
warnings.filterwarnings("ignore", category=FutureWarning, module="google")
import google.generativeai as genai
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
GENAI_API_KEY   = "AIzaSyCB_WT8WGPMTH4uE9r34fQeJvFqsbTqMLY"
SERPAPI_API_KEY = "6565b5b63009879263438da3f4ee3f56e88bf1b1aa90c8a19ce03310294452d4"
ELEVEN_API_KEY  = "sk_84b226cfbbd7fc733e01f28ed732968cae1d03a749f255ed"
genai.configure(api_key=GENAI_API_KEY)

LANG_MAP = {
    "english":   "en",
    "hindi":     "hi",
    "tamil":     "ta",
    "telugu":    "te",
    "kannada":   "kn",
    "malayalam": "ml",
    "bengali":   "bn",
    "marathi":   "mr",
    "punjabi":   "pa",
    "gujarati":  "gu",
    "odia":      "or",
    "urdu":      "ur",
}

# ── In-memory cache for trending news (avoids redundant Gemini calls) ────────
_trending_cache = {}   # key: language, value: (timestamp, result_list)
TRENDING_CACHE_TTL = 3600  # seconds — refresh every 1 hour


def get_lang_instruction(language):
    """Returns a Gemini prompt prefix to force response in the given language."""
    if language and language != "english":
        return f"Respond entirely in {language.capitalize()}. "
    return ""

@app.route('/')
def home():
    return jsonify({"message": "NewsAnchorAI backend is running"})

@app.route('/scrape', methods=['POST'])
def scrape_news():
    try:
        # Get data from the frontend as JSON
        data = request.get_json()
        q        = data.get("q")
        language = data.get("language", "english").lower().strip()
        hl       = LANG_MAP.get(language, "en")

        logger.debug(f"Scraping news for query: {q}, language: {language} (hl={hl})")
        
        params = {
            "engine": "google_news",
            "q": q,
            "hl": hl,
            "api_key": SERPAPI_API_KEY
        }
        
        search = GoogleSearch(params)
        results = search.get_dict()
        news_results = results.get("news_results", [])
        
        if not news_results:
            logger.warning("No news results found")
            return jsonify({"error": "No news results found"}), 404
        
        # Log and print the results to the console
        logger.debug(f"Found {len(news_results)} news results")
        
        # Display the result in the console (or terminal)
        for result in news_results:
            logger.debug(f"Title: {result.get('title')}, Link: {result.get('link')}")

        with open("news_results.json", "w", encoding="utf-8") as f:
            json.dump(news_results, f, indent=4, ensure_ascii=False)
        logger.debug("Saved raw results. Now extracting top 5 titles...")

        # ── Chain step 2: extract top 5 titles ──────────────────────────────
        top5 = []
        for item in news_results:
            if len(top5) >= 5:
                break
            if item.get("title") and item.get("link"):
                top5.append({"title": item["title"], "link": item["link"]})

        with open("output.json", "w", encoding="utf-8") as f:
            json.dump(top5, f, indent=4, ensure_ascii=False)
        logger.debug(f"Saved {len(top5)} titles to output.json")

        # ── Chain step 3: extract full content from each article ─────────────
        req_headers = {
            "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                           "AppleWebKit/537.36 (KHTML, like Gecko) "
                           "Chrome/91.0.4472.124 Safari/537.36")
        }
        all_articles = []
        for article in top5:
            try:
                r = requests.get(article["link"], headers=req_headers, timeout=10)
                r.raise_for_status()
                soup = BeautifulSoup(r.content, "html.parser")
                for tag in soup(["script", "style"]):
                    tag.decompose()
                text = " ".join(soup.get_text(separator=" ", strip=True).split())
                all_articles.append({
                    "title":   article["title"],
                    "link":    article["link"],
                    "content": text[:5000],
                })
                logger.debug(f"Content OK: {article['title'][:50]}")
            except Exception as ce:
                logger.error(f"Content error for {article['link']}: {ce}")

        if not all_articles:
            return jsonify({"error": "Failed to extract content from any article"}), 500

        with open("scraped_page_data.json", "w", encoding="utf-8") as f:
            json.dump(all_articles, f, indent=4, ensure_ascii=False)
        logger.debug(f"scraped_page_data.json written with {len(all_articles)} articles.")

        return jsonify({"message": "Scrape + extract complete", "count": len(all_articles)}), 200

    except Exception as e:
        logger.error(f"Error in scrape_news: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/extract_titles')
def extract_titles():
    try:
        input_file_path = "news_results.json"
        output_file_path = "output.json"
        
        logger.debug(f"Reading from {input_file_path}")
        
        if not os.path.exists(input_file_path):
            logger.error(f"File not found: {input_file_path}")
            return jsonify({"error": "News results file not found"}), 404
            
        with open(input_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
        # Limit to top 5 articles
        result = []
        count = 0
        
        # First try to get articles from main results
        for item in data:
            if count >= 5:
                break
                
            title = item.get("title")
            link = item.get("link")
            
            if title and link:
                result.append({
                    "title": title,
                    "link": link
                })
                count += 1
                logger.debug(f"Added article: {title[:50]}...")

        logger.debug(f"Extracted {len(result)} articles")
        
        with open(output_file_path, 'w', encoding='utf-8') as output_file:
            json.dump(result, output_file, indent=4, ensure_ascii=False)
            
        logger.debug(f"Saved extracted titles to {output_file_path}")
        return jsonify({"message": "Titles extracted", "count": len(result)}), 200
        
    except Exception as e:
        logger.error(f"Error in extract_titles: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/extract_content')
def extract_content():
    try:
        json_file_path = "output.json"
        output_file_path = "scraped_page_data.json"
        
        logger.debug(f"Reading from {json_file_path}")
        
        if not os.path.exists(json_file_path):
            logger.error(f"File not found: {json_file_path}")
            return jsonify({"error": "Articles file not found"}), 404
            
        with open(json_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Extract content from all articles
        all_articles = []
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        for article in data:
            try:
                link = article["link"]
                logger.debug(f"Fetching content from: {link}")
                
                response = requests.get(link, headers=headers, timeout=10)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, "html.parser")
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Get text and clean it
                text = soup.get_text(separator=' ', strip=True)
                # Remove extra whitespace
                text = ' '.join(text.split())
                
                all_articles.append({
                    "title": article["title"],
                    "link": link,
                    "content": text[:5000]  # Limit content length to avoid processing issues
                })
                logger.debug(f"Successfully extracted content from: {article['title'][:50]}...")

            except Exception as article_error:
                logger.error(f"Error extracting content from {link}: {str(article_error)}")
                continue
        
        if not all_articles:
            logger.error("No article content could be extracted")
            return jsonify({"error": "Failed to extract any article content"}), 500
        
        with open(output_file_path, 'w', encoding='utf-8') as output_file:
            json.dump(all_articles, output_file, indent=4, ensure_ascii=False)
            
        logger.debug(f"Saved scraped content to {output_file_path}")
        return jsonify({"message": "Content extracted", "count": len(all_articles)}), 200
        
    except Exception as e:
        logger.error(f"Error in extract_content: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/summarize_news', methods=['POST'])
def summarize_news():
    """
    Uses 1 Gemini API call to batch-summarize all articles in one prompt.
    This keeps usage well within the free-tier limit of 20 calls/day.
    """
    try:
        input_file_path = "scraped_page_data.json"

        data     = request.get_json(silent=True) or {}
        language = data.get("language", "english").lower().strip()
        lang_instruction = (
            f"Respond entirely in {language.capitalize()}. "
            if language != "english" else ""
        )

        if not os.path.exists(input_file_path):
            return jsonify({"error": "Scraped content file not found. Please search for news first."}), 404

        with open(input_file_path, "r", encoding="utf-8") as f:
            news_data = json.load(f)

        if not news_data:
            return jsonify({"error": "No articles found. Please search for news first."}), 404

        # Using the new google-genai SDK client

        # ── CALL 1: Batch summary of all articles in one single prompt ────────
        articles_block = ""
        for i, article in enumerate(news_data):
            articles_block += (
                f"ARTICLE {i+1}:\n"
                f"Title: {article['title']}\n"
                f"Content: {article['content'][:1500]}\n\n"
            )

        summary_prompt = f"""{lang_instruction}You are a professional news anchor. Below are {len(news_data)} news articles.
For EACH article, write a concise anchor-style summary (2-4 sentences, spoken delivery).

{articles_block}

Return ONLY a JSON array with {len(news_data)} objects in the same order. No markdown, no backticks.
Each object must have exactly these keys:
- "id" (integer, 0-indexed)
- "summary" (string, the anchor-style summary)

Example format: [{{"id": 0, "summary": "..."}}]"""

        summaries_map = {}
        try:
            logger.debug(f"Batch summary call for {len(news_data)} articles...")
            model = genai.GenerativeModel("gemini-2.5-flash")
            resp = model.generate_content(summary_prompt)
            clean = resp.text.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean)
            for item in parsed:
                summaries_map[item["id"]] = item.get("summary", "")
            logger.debug(f"Batch summary OK — got {len(summaries_map)} summaries")
        except Exception as e:
            logger.error(f"Batch summary failed: {e}")
            return jsonify({"error": f"Summary generation failed: {str(e).split(chr(10))[0][:200]}"}), 500

        # ── Build results ────────────────────────────────────────────────────
        summaries = []
        for i, article in enumerate(news_data):
            summaries.append({
                "title":       article["title"],
                "summary":     summaries_map.get(i, "Summary unavailable."),
                "source":      article.get("source", ""),
            })

        # Write full text for voice generation
        with open("news_summary.txt", "w", encoding="utf-8") as f:
            for s in summaries:
                f.write(s["summary"] + "\n\n")

        logger.debug(f"Done. {len(summaries)} summaries written to news_summary.txt")
        return jsonify({"message": "Summaries generated", "summaries": summaries}), 200

    except Exception as e:
        logger.error(f"Error in summarize_news: {str(e)}")
        return jsonify({"error": str(e).split(chr(10))[0][:300]}), 500

@app.route('/ask_question', methods=['POST'])
def ask_question():
    try:
        # Get the question from the JSON body
        data = request.get_json()
        question = data.get('question')
        language = data.get('language', 'english').lower().strip()
        lang_instruction = get_lang_instruction(language)

        if not question:
            return jsonify({"error": "No question provided"}), 400

        if not os.path.exists("scraped_page_data.json"):
            return jsonify({"error": "No article data available. Please scrape news first."}), 404

        with open("scraped_page_data.json", 'r', encoding='utf-8') as file:
            articles_data = json.load(file)

        context = "\n\n".join([
            f"Article: {article['title']}\n{article['content'][:1000]}"
            for article in articles_data
        ])

        prompt = f"""{lang_instruction}Based on the following news articles:

{context}

Please answer this question: {question}

Provide a detailed answer for the question based only on the information contained in these articles.
The output has to mimic the actual response of a news anchor and should directly start with the news article."""
        
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        
        return jsonify({
            "question": question,
            "answer": response.text
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/generate_voice')
def generate_voice():
    try:
        if not os.path.exists("news_summary.txt"):
            logger.error("Summary file not found")
            return jsonify({"error": "No summary available to convert to speech"}), 404
            
        with open("news_summary.txt", "r", encoding='utf-8') as file:
            text = file.read().strip()
        
        if not text:
            logger.error("Summary file is empty")
            return jsonify({"error": "The summary file is empty"}), 400

        logger.debug("Generating speech from summary using ElevenLabs")

        # Initialize ElevenLabs client
        client = ElevenLabs(api_key=ELEVEN_API_KEY)

        # Convert text to speech
        audio_generator = client.text_to_speech.convert(
            text=text[:4500],  # ElevenLabs free tier max ~5000 chars; 4500 covers all 5 summaries
            voice_id="EXAVITQu4vr4xnSDxMaL",  # Bella (Female)
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )

        # Save to static/ so the frontend can access it
        os.makedirs("static", exist_ok=True)
        output_file = os.path.join("static", "output.mp3")
        with open(output_file, "wb") as audio_file:
            for chunk in audio_generator:
                audio_file.write(chunk)

        logger.debug(f"Successfully saved speech to {output_file}")
        return jsonify({"message": "Speech generated", "audio_url": "/static/output.mp3"}), 200
        
    except Exception as e:
        if hasattr(e, 'body') and e.body:
            raw = str(e.body)
        else:
            raw = str(e)
            
        logger.error(f"Error in generate_voice: {raw}")

        # ── Return a clean, human-readable message instead of raw exception ──
        if "401" in raw or "unusual_activity" in raw or "free_tier" in raw or "detected_unusual" in raw:
            friendly = (
                "ElevenLabs API error: Your free-tier key has been flagged or disabled. "
                "Please log into elevenlabs.io, check your account status, and make sure "
                "you are not using a VPN/proxy. You may need to upgrade to a paid plan."
            )
        elif "quota_exceeded" in raw or "quota" in raw.lower() or "limit" in raw.lower():
            friendly = "ElevenLabs quota exceeded. Please check your account usage at elevenlabs.io."
        elif "404" in raw or "not_found" in raw:
            friendly = "ElevenLabs voice ID not found. Please check the voice_id in app.py."
        elif "No summary" in raw or "summary file" in raw:
            friendly = "No news summary found. Please search for news on the Home page first."
        else:
            # Try to parse json body to extract detail message
            try:
                if isinstance(e.body, dict):
                    friendly = f"Audio generation failed: {e.body.get('detail', raw)[:200]}"
                elif isinstance(e.body, str):
                    friendly = f"Audio generation failed: {e.body[:200]}"
                else:
                    friendly = f"Audio generation failed: {raw.split(chr(10))[0][:200]}"
            except:
                friendly = f"Audio generation failed: {raw.split(chr(10))[0][:200]}"

        return jsonify({"error": friendly}), 500


@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)


@app.route('/extract_news_thumbnails', methods=['POST'])
def extract_news_thumbnails():
    try:
        data     = request.get_json(silent=True) or {}
        language = data.get("language", "english").lower().strip()
        hl       = LANG_MAP.get(language, "en")

        app.logger.debug(f"Extracting thumbnails, language={language} hl={hl}")

        params = {
            "engine":  "google_news",
            "q":       "trending",
            "hl":      hl,
            "api_key": SERPAPI_API_KEY,
        }

        search = GoogleSearch(params)
        results = search.get_dict()
        news_results = results.get("news_results", [])

        if not news_results:
            app.logger.warning("No news results found")
            return jsonify({"error": "No news results found"}), 404

        app.logger.debug(f"Found {len(news_results)} news results")

        # Extract top 5 news titles and thumbnails
        result = []
        for item in news_results[:5]:
            title = item.get("title")
            link = item.get("link")
            thumbnail = item.get("thumbnail")

            if title and link:
                result.append({
                    "title": title,
                    "link": link,
                    "thumbnail": thumbnail if thumbnail else "No thumbnail available"
                })

        app.logger.debug(f"Extracted {len(result)} articles")

        # Return the result as JSON
        return jsonify(result), 200

    except Exception as e:
        app.logger.error(f"Error in extract_news_thumbnails: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/extract_top_trending_news', methods=['GET'])
def extract_top_trending_news():
    import time
    try:
        language = request.args.get("language", "english").lower().strip()
        hl       = LANG_MAP.get(language, "en")

        # ── Serve from cache if fresh (avoids burning Gemini quota on every load) ──
        cached = _trending_cache.get(language)
        if cached:
            cache_time, cache_result = cached
            if time.time() - cache_time < TRENDING_CACHE_TTL:
                logger.debug(f"Serving trending news from cache for language={language}")
                return jsonify(cache_result), 200

        logger.debug(f"Extracting top trending news, language={language} hl={hl}")

        params = {
            "engine":  "google_news",
            "q":       "latest",
            "hl":      hl,
            "api_key": SERPAPI_API_KEY,
        }

        search = GoogleSearch(params)
        results = search.get_dict()
        news_results = results.get("news_results", [])

        if not news_results:
            logger.warning("No news results found")
            return jsonify({"error": "No news results found"}), 404

        top_articles = news_results[:15]

        result = []
        for item in top_articles:
            source_name = item.get("source", {}).get("name", "")
            result.append({
                "title":       item.get("title"),
                "link":        item.get("link"),
                "thumbnail":   item.get("thumbnail"),
                "source":      source_name or "Unknown Source",
            })

        logger.debug(f"Successfully processed {len(result)} trending articles.")

        with open("top_trending_news.json", "w", encoding="utf-8") as f:
            json.dump(result, f, indent=4, ensure_ascii=False)

        # Store in cache so repeat loads don't burn Gemini quota
        _trending_cache[language] = (time.time(), result)

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error in extract_top_trending_news: {str(e)}")
        return jsonify({"error": str(e)}), 500


# extract_top_trending_news()   
if __name__ == "__main__":
    os.makedirs("static", exist_ok=True)
    app.run(debug=True)