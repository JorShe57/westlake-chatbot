# Westlake Chatbot Admin Portal

A comprehensive chatbot solution for the City of Westlake with an integrated admin portal for managing conversations, analytics, and settings.

## 🚀 Features

### Landing Page
- **Professional Design**: Modern, responsive landing page with city branding
- **Hero Section**: Eye-catching banner with call-to-action buttons
- **Feature Highlights**: Showcase of chatbot capabilities and benefits
- **Quick Actions**: Direct links to popular city services
- **Contact Information**: Easy access to city hall contact details
- **Navigation**: Clear paths to chat, sign up, and sign in

### Public Chat Interface
- **Real-time Chat**: Interactive chatbot interface with message bubbles
- **Quick Actions**: Direct links to city services (permits, payments, documents)
- **Quick Prompts**: Pre-defined questions for common city inquiries
- **Responsive Design**: Mobile-friendly with collapsible sidebar
- **Message Formatting**: Support for structured messages with headings and lists
- **Link Parsing**: Automatic detection and formatting of URLs and phone numbers

### Admin Portal
- **Dashboard**: Overview of chatbot performance and statistics
- **Conversation Management**: View and search all conversations
- **Analytics**: Detailed performance metrics and insights
- **User Management**: Admin user management and permissions
- **Settings**: Configure chatbot settings and n8n integration
- **Export Functionality**: Download conversation data as JSON

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.2.4 with React 19
- **Styling**: Tailwind CSS 3.4+ with shadcn/ui components
- **Backend Integration**: n8n webhook endpoint
- **State Management**: React hooks (useState, useRef, useEffect)
- **Package Manager**: npm

## 📁 Project Structure

```
westlake-chatbot/
├── app/
│   ├── page.tsx                 # Main chat interface
│   ├── admin/
│   │   ├── page.tsx            # Admin portal dashboard
│   │   └── conversation/
│   │       └── [id]/
│   │           └── page.tsx    # Conversation detail view
│   └── layout.tsx              # Root layout
├── components/
│   ├── message-renderer.tsx    # Message formatting component
│   ├── link-parser.tsx         # URL and phone number parser
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── config.ts               # Centralized configuration
│   └── utils.ts                # Utility functions
└── public/
    └── images/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd westlake-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-webhook-url
   NEXT_PUBLIC_ADMIN_USERNAME=admin
   NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
   NEXT_PUBLIC_WELCOME_MESSAGE=Your custom welcome message
   NEXT_PUBLIC_SESSION_TIMEOUT=30
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Landing Page: http://localhost:3000
   - Chat Interface: http://localhost:3000/chat
   - Admin Portal: http://localhost:3000/admin
   - Sign Up: http://localhost:3000/auth/signup
   - Sign In: http://localhost:3000/auth/signin

## 🔧 Configuration

The application uses a centralized configuration system in `lib/config.ts`. Key settings include:

### n8n Integration
- Webhook URL for chatbot responses
- Error handling and fallback messages

### Admin Portal
- Authentication credentials
- Session management

### Chatbot Settings
- Welcome message
- Session timeout
- Rate limiting
- Message length limits

### City Information
- Contact details
- Quick actions and popular topics
- Quick prompts for common questions

## 🔐 Admin Portal Access

### Default Credentials
- **Username**: `admin`
- **Password**: `westlake2024`

### Features Available
1. **Dashboard**: Overview of chatbot statistics
2. **Conversations**: View and search all chat sessions
3. **Analytics**: Performance metrics and insights
4. **Users**: Admin user management
5. **Settings**: Configure chatbot and n8n integration

## 📊 Admin Portal Features

### Dashboard
- Total conversations count
- Active sessions
- Satisfaction rate
- Average response time
- Recent conversation list

### Conversation Management
- Search and filter conversations
- View detailed message history
- Export conversation data
- User information and metadata

### Analytics
- Performance metrics
- Popular topics analysis
- Error rate tracking
- Session duration statistics

### Settings
- n8n webhook configuration
- Welcome message customization
- Session timeout settings
- Connection testing

## 🔗 n8n Integration

The chatbot integrates with n8n through webhook endpoints:

### Webhook Configuration
- **URL**: Configurable via environment variables
- **Method**: POST
- **Payload**: JSON with sessionId, message, and timestamp

### Expected Response Format
```json
{
  "response": "Bot response text",
  "formatted": true,
  "message": [
    {
      "type": "text",
      "content": "Formatted message content"
    },
    {
      "type": "list-item", 
      "content": "List item content"
    }
  ]
}
```

## 🎨 Customization

### Styling
- Primary color: `#2d5016` (Westlake green)
- Responsive design with Tailwind CSS
- Custom components in `components/ui/`

### Content
- Quick actions and topics in `lib/config.ts`
- Welcome message and error messages
- City information and contact details

### Features
- Add new quick actions
- Modify popular topics
- Update quick prompts
- Customize error messages

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set all `NEXT_PUBLIC_*` variables
- Configure n8n webhook URL
- Update admin credentials
- Set appropriate session timeouts

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting

### Adding New Features
1. Update configuration in `lib/config.ts`
2. Add new components in `components/`
3. Update admin portal pages as needed
4. Test with the development server

## 📝 License

This project is developed for the City of Westlake.

## 🤝 Support

For technical support or questions about the chatbot implementation, contact the development team.

---

**Note**: This is a demo implementation. For production use, ensure proper security measures, authentication, and data persistence are implemented. # westlake-chatbot
