# WebStorm / Rider IDE Setup Guide

This project includes full JetBrains IDE configuration for WebStorm or Rider, making it easy to start development immediately.

## 🚀 Quick Start

1. **Open the project in WebStorm/Rider:**
   ```bash
   # Option 1: From command line
   webstorm /path/to/crypto-wallet-mvp
   
   # Option 2: From IDE
   File → Open → Select crypto-wallet-mvp folder
   ```

2. **Install dependencies:**
   - WebStorm will prompt to install npm packages
   - Or manually run: `npm install`

3. **Run the application:**
   - Use the pre-configured run configurations in the top-right dropdown
   - Select "npm start" and click the green play button
   - Or use Alt+Shift+F10 (Windows/Linux) / Ctrl+R (Mac)

## 📋 Pre-configured Features

### Run Configurations
Four npm scripts are pre-configured and ready to use:
- **npm start** - Start both frontend (port 3000) and backend (port 5000)
- **npm run dev** - Start frontend only in development mode
- **npm run server** - Start backend API only
- **npm run build** - Build production bundle

### Code Quality Tools
- **ESLint** - JavaScript/TypeScript linting (auto-fix on save enabled)
- **Prettier** - Code formatting with consistent style
- **EditorConfig** - Consistent coding styles across different editors

### TypeScript Support
- Full TypeScript integration with tsconfig.json
- Automatic type checking
- IntelliSense and autocomplete
- Jump to definition (Ctrl+Click)

### Project Structure
Source folders are marked correctly:
- `src/` - React frontend source
- `server/` - Node.js backend source
- `node_modules/` - Excluded from indexing
- `dist/` and `build/` - Excluded from indexing

## ⚙️ IDE Settings

### Code Style
- **Indent:** 2 spaces
- **Line endings:** LF (Unix-style)
- **Quotes:** Single quotes for JS/TS
- **Semicolons:** Required
- **Trailing commas:** When multiline
- **Max line length:** 100 characters (soft limit at 80)

### Keyboard Shortcuts (Default WebStorm)
| Action | Windows/Linux | macOS |
|--------|--------------|-------|
| Run current config | Alt+Shift+F10 | Ctrl+R |
| Debug | Shift+F9 | Ctrl+D |
| Find in files | Ctrl+Shift+F | Cmd+Shift+F |
| Refactor/Rename | Shift+F6 | Shift+F6 |
| Format code | Ctrl+Alt+L | Cmd+Option+L |
| Optimize imports | Ctrl+Alt+O | Ctrl+Option+O |
| Quick fix | Alt+Enter | Option+Enter |
| Search everywhere | Double Shift | Double Shift |

## 🔧 Recommended Plugins

Install these from Settings → Plugins for enhanced experience:

1. **Database Tools** (Built-in in Ultimate/Rider)
   - Connect to PostgreSQL database
   - Run SQL queries
   - View table structure

2. **GitToolBox**
   - Enhanced Git integration
   - Inline blame annotations
   - Auto-fetch

3. **Rainbow Brackets**
   - Color-coded bracket pairs
   - Easier code navigation

4. **Key Promoter X**
   - Learn keyboard shortcuts
   - Productivity tips

5. **.env files support**
   - Syntax highlighting for .env files
   - Variable references

## 🗄️ Database Integration

### Connecting to PostgreSQL (Ultimate/Rider only)

1. Open Database tool window (View → Tool Windows → Database)
2. Click + → Data Source → PostgreSQL
3. Enter connection details:
   ```
   Host: localhost
   Port: 5432
   Database: crypto_wallet
   User: your_username
   Password: your_password
   ```
4. Click "Test Connection" then "OK"

### Viewing Database Schema
- Navigate to crypto_wallet → schemas → public → tables
- Double-click any table to view data
- Right-click → SQL Scripts → SELECT * to query

## 🐛 Debugging

### Frontend Debugging
1. Install "JetBrains IDE Support" Chrome extension
2. Set breakpoints in TypeScript/JSX files
3. Run "npm start" configuration
4. Click the debug icon (🐞) next to the run button
5. Debug in Chrome with IDE breakpoints

### Backend Debugging
1. Add a JavaScript Debug configuration:
   - Run → Edit Configurations → + → Node.js
   - Node parameters: `server/index.js`
   - Working directory: Project root
2. Set breakpoints in server/*.js files
3. Click debug icon

## 🧪 Testing Setup (Future Enhancement)

To add testing:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Then create a Jest run configuration:
- Run → Edit Configurations → + → Jest
- Jest package: `node_modules/jest`
- Working directory: Project root

## 📝 Git Integration

The IDE includes Git integration:
- **Commit:** Ctrl+K (Cmd+K on Mac)
- **Push:** Ctrl+Shift+K (Cmd+Shift+K on Mac)
- **Pull:** Ctrl+T (Cmd+T on Mac)
- **View changes:** Alt+9 (Cmd+9 on Mac)

### Git Configuration
Already configured in .idea/vcs.xml:
- Root directory mapped to Git
- Changelist management enabled

## 🔍 Code Navigation Tips

### Quick Navigation
- **Recent files:** Ctrl+E (Cmd+E)
- **Go to file:** Ctrl+Shift+N (Cmd+Shift+N)
- **Go to symbol:** Ctrl+Alt+Shift+N (Cmd+Option+Shift+N)
- **Find usages:** Alt+F7 (Option+F7)
- **Go to implementation:** Ctrl+Alt+B (Cmd+Option+B)

### Refactoring
- **Rename:** Shift+F6
- **Extract variable:** Ctrl+Alt+V (Cmd+Option+V)
- **Extract method:** Ctrl+Alt+M (Cmd+Option+M)
- **Inline:** Ctrl+Alt+N (Cmd+Option+N)

## 📦 Project Dependencies

The IDE automatically recognizes:
- **React** (v18+) - Frontend framework
- **Redux Toolkit** - State management
- **TypeScript** - Type safety
- **Express** - Backend API
- **PostgreSQL** - Database (via pg package)
- **Webpack** - Module bundler
- **Babel** - JavaScript compiler

## 🎨 UI Customization

Personalize your IDE:
1. Settings → Appearance & Behavior → Appearance
   - Theme: Darcula (dark) or Light
   - Font size: Adjust to preference
2. Settings → Editor → Color Scheme
   - Choose from built-in schemes
   - Or download custom themes

## 🚨 Troubleshooting

### "Cannot resolve symbol" errors
- **Solution:** File → Invalidate Caches → Invalidate and Restart

### TypeScript not recognized
- **Solution:** 
  - Ensure TypeScript is installed: `npm install typescript`
  - Settings → Languages & Frameworks → TypeScript
  - Check "TypeScript Language Service" is enabled

### ESLint not working
- **Solution:**
  - Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
  - Select "Automatic ESLint configuration"
  - Enable "Run eslint --fix on save"

### Node.js not detected
- **Solution:**
  - Settings → Languages & Frameworks → Node.js
  - Point to Node.js installation
  - Enable "Node.js Core library"

### Database connection fails
- **Solution:**
  - Ensure PostgreSQL is running: `systemctl status postgresql`
  - Check .env file has correct credentials
  - Test connection from terminal: `psql -U username -d crypto_wallet`

## 💡 Pro Tips

1. **Multi-cursor editing:** Alt+Click (Option+Click)
2. **Column selection:** Alt+Shift+Insert (Cmd+Shift+8)
3. **Live templates:** Type `log` then Tab for `console.log()`
4. **Scratch files:** Ctrl+Shift+Alt+Insert for temporary code
5. **Local history:** Right-click file → Local History → Show History

## 📚 Additional Resources

- [WebStorm Documentation](https://www.jetbrains.com/webstorm/learn/)
- [Rider Documentation](https://www.jetbrains.com/rider/learn/)
- [Keyboard Shortcuts PDF](https://resources.jetbrains.com/storage/products/webstorm/docs/WebStorm_ReferenceCard.pdf)
- [JetBrains YouTube](https://www.youtube.com/user/JetBrainsTV)

## 🆘 Support

If you encounter issues:
1. Check the [JetBrains Issue Tracker](https://youtrack.jetbrains.com/)
2. Visit the [JetBrains Community](https://intellij-support.jetbrains.com/hc/en-us/community/topics)
3. File an issue in this project's GitHub repository

---

**Happy coding! 🎉**

The project is fully configured and ready for development. Just open it in WebStorm or Rider and start building!
