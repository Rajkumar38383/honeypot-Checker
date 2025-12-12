# Honeypot Token Detector

A modern web application to detect honeypot tokens by analyzing smart contract addresses on Ethereum and Binance Smart Chain.

## Features

- 🔍 **Real-time Contract Analysis** - Instant honeypot detection using Honeypot.is API
- 🌐 **Multi-Chain Support** - Ethereum and Binance Smart Chain
- 📊 **Risk Assessment** - Visual risk meter with detailed analysis
- 💎 **Premium UI** - Dark mode with glassmorphism and smooth animations
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 💾 **Recent Scans** - Local storage of your last 5 scans
- 🔗 **Explorer Links** - Direct links to blockchain explorers

## How to Use

1. **Select Network**: Choose Ethereum or BSC from the dropdown
2. **Enter Address**: Paste the token contract address (0x format)
3. **Scan**: Click "Scan Contract" button
4. **Review**: Check the risk assessment and detailed analysis

## Testing

Try these sample addresses to see different results:

- **Honeypot Example**: `0x1234567890123456789012345678901234567abc`
- **Safe Token Example**: `0x1234567890123456789012345678901234567890`

The application uses the last character of the address to simulate different scenarios when the API is unavailable.

## What It Checks

✅ Honeypot detection
✅ Buy/sell tax analysis
✅ Contract verification status
✅ Proxy call detection
✅ Holder distribution
✅ Token information

## Technology Stack

- **HTML5** - Semantic structure
- **CSS3** - Modern design with animations
- **JavaScript (ES6+)** - API integration and logic
- **Honeypot.is API** - Contract analysis

## Local Development

Simply open `index.html` in any modern web browser. No build process or server required!

```bash
# Open in default browser
index.html
```

## Deployment

This is a static web application that can be hosted on:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

## Browser Support

✅ Chrome/Edge (Chromium)
✅ Firefox
✅ Safari
✅ Mobile browsers

## Security Notice

⚠️ **Important**: This tool provides indicators but is not financial advice. Always do your own research before investing in any token.

## API Information

Uses the Honeypot.is API:
- **Endpoint**: `https://api.honeypot.is/v2/IsHoneypot`
- **Free tier available**
- **No API key required**

## Project Structure

```
honeypot-detector/
├── index.html          # Main HTML file
├── style.css           # Styling and animations
├── script.js           # JavaScript logic
└── README.md           # This file
```

## Future Enhancements

- Additional blockchain networks (Polygon, Arbitrum, etc.)
- Liquidity pool analysis
- Token watchlist
- Export analysis reports
- Email alerts

## License

Free to use for personal and commercial projects.

---

**Built with ❤️ for the crypto community**
