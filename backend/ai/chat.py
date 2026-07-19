import os
from typing import Dict, List, Optional, Any

def get_chat_response(symbol: str, query: str, context: Dict, conversation_history: Optional[List[Dict]] = None) -> str:
    """Generate chatbot response using GPT-4-Turbo with conversation history"""
    
    # Try OpenAI GPT-4-Turbo first
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        return get_openai_response(symbol, query, context, openai_key, conversation_history)
    
    # Try Gemini
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        return get_gemini_response(symbol, query, context, gemini_key, conversation_history)
    
    # Fallback to improved rule-based responses
    return get_fallback_response(symbol, query, context)

def get_openai_response(symbol: str, query: str, context: Dict, api_key: str, conversation_history: Optional[List[Dict]] = None) -> str:
    """Use OpenAI GPT-4-Turbo with conversation history"""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        # Build context string
        context_str = build_context_string(symbol, context)
        
        # Build conversation messages
        messages = []
        
        # System prompt with enhanced capabilities
        system_prompt = """You are AlphaCross, an intelligent and context-aware AI trading assistant powered by GPT-4-Turbo.

Your capabilities:
- Remember previous conversation context and user preferences
- Explain trading signals and technical indicators naturally
- Answer "should I buy/sell" questions with balanced, educational responses
- Adapt your tone based on user intent (casual, technical, educational)
- Provide actionable insights while emphasizing risk management

Guidelines:
- Keep responses conversational and natural (2-4 sentences typically)
- Remember what the user asked before and reference it when relevant
- For buy/sell questions, provide analysis but always include risk disclaimers
- Use the stock's current technical data to support your explanations
- Be helpful, accurate, and never provide direct financial advice"""
        
        messages.append({"role": "system", "content": system_prompt})
        
        # Add conversation history if available
        if conversation_history:
            for msg in conversation_history[-10:]:  # Keep last 10 messages for context
                if msg.get('role') and msg.get('content'):
                    messages.append({
                        "role": msg['role'],
                        "content": msg['content']
                    })
        
        # Add current context and query
        user_prompt = f"""Current stock context for {symbol}:
{context_str}

User's current question: {query}

Provide a helpful, context-aware response. If this relates to previous conversation, reference it naturally."""
        
        messages.append({"role": "user", "content": user_prompt})
        
        # Use GPT-4-Turbo for better context understanding
        # Try different GPT-4 model names based on availability
        model_name = "gpt-4-turbo-preview"
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )
        except Exception as e:
            # Fallback to gpt-4-1106-preview or gpt-3.5-turbo
            try:
                model_name = "gpt-4-1106-preview"
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    max_tokens=300,
                    temperature=0.7
                )
            except:
                raise e
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI API error: {e}")
        # Try GPT-3.5 as fallback
        try:
            return get_openai_gpt35_response(symbol, query, context, api_key, conversation_history)
        except:
            return get_fallback_response(symbol, query, context)

def get_openai_gpt35_response(symbol: str, query: str, context: Dict, api_key: str, conversation_history: Optional[List[Dict]] = None) -> str:
    """Fallback to GPT-3.5 if GPT-4 not available"""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        context_str = build_context_string(symbol, context)
        
        messages = [{
            "role": "system",
            "content": "You are AlphaCross, a friendly AI trading assistant. Remember conversation context and provide helpful responses."
        }]
        
        if conversation_history:
            for msg in conversation_history[-5:]:
                if msg.get('role') and msg.get('content'):
                    messages.append({"role": msg['role'], "content": msg['content']})
        
        messages.append({
            "role": "user",
            "content": f"Context: {context_str}\n\nUser: {query}"
        })
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=200,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        return get_fallback_response(symbol, query, context)

def get_gemini_response(symbol: str, query: str, context: Dict, api_key: str, conversation_history: Optional[List[Dict]] = None) -> str:
    """Use Gemini API with conversation history"""
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        model = genai.GenerativeModel('gemini-pro')
        context_str = build_context_string(symbol, context)
        
        # Build conversation context
        history_text = ""
        if conversation_history:
            for msg in conversation_history[-5:]:
                role = "User" if msg.get('role') == 'user' else "Assistant"
                history_text += f"{role}: {msg.get('content', '')}\n"
        
        prompt = f"""You are AlphaCross, a context-aware AI trading assistant.

Previous conversation:
{history_text}

Current context for {symbol}:
{context_str}

User: {query}

Respond naturally, remembering previous context."""
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API error: {e}")
        return get_fallback_response(symbol, query, context)

def build_context_string(symbol: str, context: Dict) -> str:
    """Build context string from context dict"""
    if not context:
        return f"Stock: {symbol} (No current data available)"
    
    parts = [f"Stock: {symbol}"]
    
    if context.get('prediction'):
        parts.append(f"ML Prediction: {context.get('prediction')} (confidence: {context.get('confidence', 'N/A')})")
    
    if context.get('ema20'):
        parts.append(f"EMA 20: {context.get('ema20')}")
    
    if context.get('ema50'):
        parts.append(f"EMA 50: {context.get('ema50')}")
    
    if context.get('rsi'):
        parts.append(f"RSI: {context.get('rsi')}")
    
    if context.get('sentiment'):
        parts.append(f"News Sentiment: {context.get('sentiment')}")
    
    return ", ".join(parts)

def explain_chart(symbol: str, chart_data: List[Dict], context: Dict) -> str:
    """Generate AI explanation of chart trends"""
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        return generate_chart_explanation_fallback(symbol, chart_data, context)
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=openai_key)
        
        # Analyze chart data
        if chart_data and len(chart_data) > 0:
            recent = chart_data[-10:] if len(chart_data) >= 10 else chart_data
            ema20_trend = "rising" if recent[-1]['ema20'] > recent[0]['ema20'] else "falling"
            ema50_trend = "rising" if recent[-1]['ema50'] > recent[0]['ema50'] else "falling"
            price_trend = "rising" if recent[-1]['close'] > recent[0]['close'] else "falling"
            
            chart_summary = f"""
Recent 10-day trends:
- Price: {price_trend}
- EMA 20: {ema20_trend} (current: {recent[-1]['ema20']})
- EMA 50: {ema50_trend} (current: {recent[-1]['ema50']})
- RSI: {context.get('rsi', 'N/A')}
"""
        else:
            chart_summary = "Limited chart data available"
        
        prompt = f"""Analyze this stock chart and provide a 2-3 sentence summary of current trends:

Stock: {symbol}
{chart_summary}
Current Prediction: {context.get('prediction', 'Neutral')} ({context.get('confidence', 0)*100:.0f}% confidence)

Provide a concise, natural explanation of what the chart shows (e.g., "EMA20 rising, RSI stable - momentum increasing")."""
        
        # Try GPT-4, fallback to GPT-3.5
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a technical analysis expert. Provide concise chart explanations."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
        except:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a technical analysis expert. Provide concise chart explanations."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Chart explanation error: {e}")
        return generate_chart_explanation_fallback(symbol, chart_data, context)

def generate_chart_explanation_fallback(symbol: str, chart_data: List[Dict], context: Dict) -> str:
    """Fallback chart explanation"""
    if not chart_data or len(chart_data) < 2:
        return f"{symbol} chart shows limited data. Current prediction: {context.get('prediction', 'Neutral')}."
    
    recent = chart_data[-5:]
    ema20_trend = "rising" if recent[-1]['ema20'] > recent[0]['ema20'] else "falling"
    ema50_trend = "rising" if recent[-1]['ema50'] > recent[0]['ema50'] else "falling"
    rsi = context.get('rsi', 50)
    
    rsi_status = "overbought" if rsi > 70 else "oversold" if rsi < 30 else "neutral"
    
    return f"EMA20 is {ema20_trend}, EMA50 is {ema50_trend}, with RSI at {rsi} ({rsi_status}). This suggests {'increasing' if ema20_trend == 'rising' else 'decreasing'} momentum."

def generate_stock_summary(symbol: str, context: Dict, chart_data: Optional[List[Dict]] = None) -> str:
    """Generate 2-line AI summary for stock"""
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        return generate_summary_fallback(symbol, context)
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=openai_key)
        
        context_str = build_context_string(symbol, context)
        
        prompt = f"""Generate a concise 2-line daily summary for {symbol}:

{context_str}

Provide exactly 2 lines:
Line 1: Current signal and key technical indicator status
Line 2: Short-term outlook and momentum assessment

Format: Two sentences, professional but accessible."""
        
        # Try GPT-4, fallback to GPT-3.5
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a financial analyst. Generate concise 2-line stock summaries."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100,
                temperature=0.7
            )
        except:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a financial analyst. Generate concise 2-line stock summaries."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100,
                temperature=0.7
            )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Summary generation error: {e}")
        return generate_summary_fallback(symbol, context)

def generate_summary_fallback(symbol: str, context: Dict) -> str:
    """Fallback summary generation"""
    prediction = context.get('prediction', 'Neutral')
    confidence = context.get('confidence', 0)
    ema20 = context.get('ema20', 'N/A')
    ema50 = context.get('ema50', 'N/A')
    
    line1 = f"{symbol} shows a {prediction.lower()} signal with {int(confidence*100)}% confidence."
    line2 = f"EMA 20 ({ema20}) is {'above' if prediction == 'Bullish' else 'below'} EMA 50 ({ema50}), indicating {'upward' if prediction == 'Bullish' else 'downward'} momentum."
    
    return f"{line1} {line2}"

def get_news_sentiment(symbol: str) -> Dict[str, Any]:
    """Get news sentiment for stock (simulated - integrate with news API)"""
    # In production, integrate with NewsAPI, Alpha Vantage, or similar
    # For now, return simulated sentiment based on prediction
    import random
    
    # Simulate sentiment analysis
    sentiments = ['positive', 'neutral', 'negative']
    weights = [0.4, 0.4, 0.2]  # Slight bias toward positive/neutral
    
    sentiment = random.choices(sentiments, weights=weights)[0]
    score = random.uniform(0.3, 0.9) if sentiment == 'positive' else random.uniform(-0.3, 0.3) if sentiment == 'neutral' else random.uniform(-0.9, -0.3)
    
    return {
        "sentiment": sentiment,
        "score": round(score, 2),
        "articles_count": random.randint(5, 25),
        "last_updated": "today"
    }

def get_fallback_response(symbol: str, query: str, context: Dict) -> str:
    """Improved rule-based fallback responses with better pattern matching"""
    query_lower = query.lower().strip()
    
    # Handle greetings and casual conversation
    greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings']
    if any(greeting in query_lower for greeting in greetings):
        prediction = context.get('prediction', 'Neutral')
        return f"Hello! I'm AlphaCross AI, your trading assistant. I can help you understand {symbol}'s current {prediction.lower()} signal and trading strategies. What would you like to know?"
    
    # Handle thanks and appreciation
    if any(word in query_lower for word in ['thank', 'thanks', 'appreciate']):
        return "You're welcome! Feel free to ask me anything else about trading strategies or market analysis."
    
    # Handle "should I buy/sell" questions
    if any(phrase in query_lower for phrase in ['should i buy', 'should i sell', 'buy now', 'sell now']):
        prediction = context.get('prediction', 'Neutral')
        confidence = context.get('confidence', 0)
        
        if 'buy' in query_lower:
            if prediction == 'Bullish' and confidence > 0.7:
                return f"Based on the {prediction.lower()} signal ({int(confidence*100)}% confidence), there's potential for upward movement. However, always do your own research, consider risk management, and never invest more than you can afford to lose. This is not financial advice."
            else:
                return f"The current signal is {prediction.lower()} with {int(confidence*100)}% confidence. Consider waiting for stronger confirmation or consult with a financial advisor. Remember: this is analysis, not advice."
        else:  # sell
            if prediction == 'Bearish' and confidence > 0.7:
                return f"The {prediction.lower()} signal ({int(confidence*100)}% confidence) suggests potential downward pressure. Consider risk management strategies, but always make your own informed decisions. This is not financial advice."
            else:
                return f"Current signal is {prediction.lower()}. Evaluate your position based on your risk tolerance and investment goals. Consult a financial advisor for personalized advice."
    
    # Handle "what is" questions
    if query_lower.startswith('what is'):
        if 'rsi' in query_lower:
            return "RSI (Relative Strength Index) is a momentum indicator that measures the speed and magnitude of price changes. Values above 70 suggest overbought conditions, while below 30 indicate oversold conditions."
        elif 'ema' in query_lower or 'moving average' in query_lower:
            return "EMA (Exponential Moving Average) gives more weight to recent prices. We use EMA 20 (short-term) and EMA 50 (long-term) to identify trend changes through crossovers."
        elif 'crossover' in query_lower:
            return "A crossover occurs when two moving averages intersect. A bullish crossover (EMA 20 crosses above EMA 50) suggests upward momentum, while a bearish crossover indicates potential downward movement."
        elif 'alphacross' in query_lower or 'you' in query_lower:
            return "I'm AlphaCross, an AI trading assistant that uses machine learning to predict moving average crossovers and help you understand stock market trends."
        else:
            return f"I can explain trading concepts related to {symbol}. What specifically would you like to know about?"
    
    # Handle "explain" requests
    if query_lower.startswith('explain'):
        if 'crossover' in query_lower or 'strategy' in query_lower:
            return "The crossover strategy uses EMA 20 and EMA 50. When EMA 20 crosses above EMA 50, it's a bullish signal suggesting buying opportunities. When it crosses below, it's bearish, indicating potential selling points."
        elif 'rsi' in query_lower:
            rsi = context.get('rsi', 'N/A')
            return f"RSI measures momentum. Currently at {rsi}. Above 70 means overbought (potential sell), below 30 means oversold (potential buy). Between 30-70 is neutral."
        else:
            return f"I can explain trading strategies, indicators, or {symbol}'s current signals. What would you like me to explain?"
    
    # Handle prediction questions
    if any(word in query_lower for word in ['prediction', 'predict', 'forecast', 'outlook']):
        prediction = context.get('prediction', 'Neutral')
        confidence = context.get('confidence', 0)
        ema20 = context.get('ema20', 'N/A')
        ema50 = context.get('ema50', 'N/A')
        
        if prediction == 'Bullish':
            return f"{symbol} shows a {prediction.lower()} signal with {int(confidence * 100)}% confidence. EMA 20 ({ema20}) is above EMA 50 ({ema50}), suggesting potential upward momentum in the next few days."
        elif prediction == 'Bearish':
            return f"{symbol} shows a {prediction.lower()} signal with {int(confidence * 100)}% confidence. EMA 20 ({ema20}) is below EMA 50 ({ema50}), indicating potential downward pressure."
        else:
            return f"{symbol} currently shows a neutral signal. The EMAs are close together, suggesting no clear trend direction at the moment."
    
    # Handle "why" questions
    if query_lower.startswith('why'):
        prediction = context.get('prediction', 'Neutral')
        ema20 = context.get('ema20', 'N/A')
        ema50 = context.get('ema50', 'N/A')
        rsi = context.get('rsi', 'N/A')
        
        if prediction == 'Bullish':
            return f"{symbol} is predicted bullish because EMA 20 ({ema20}) is above EMA 50 ({ema50}), and RSI is at {rsi}. This combination suggests upward momentum and potential buying interest."
        elif prediction == 'Bearish':
            return f"{symbol} is predicted bearish because EMA 20 ({ema20}) is below EMA 50 ({ema50}), and RSI is at {rsi}. This indicates downward pressure and potential selling pressure."
        else:
            return f"{symbol} shows a neutral signal because the EMAs are close together (EMA 20: {ema20}, EMA 50: {ema50}) and RSI is at {rsi}, indicating no strong directional bias."
    
    # Default contextual response
    prediction = context.get('prediction', 'Neutral')
    ema20 = context.get('ema20', 'N/A')
    ema50 = context.get('ema50', 'N/A')
    rsi = context.get('rsi', 'N/A')
    
    if context.get('prediction'):
        return f"Regarding {symbol}: The current prediction is {prediction.lower()}. EMA 20 is at {ema20}, EMA 50 is at {ema50}, and RSI is at {rsi}. Could you be more specific about what you'd like to know?"
    else:
        return f"I'm here to help you understand {symbol} and trading strategies. You can ask me about predictions, RSI, crossovers, or any trading concepts. What would you like to know?"