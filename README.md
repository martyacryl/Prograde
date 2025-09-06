# ProGrade - Football Play Analysis Platform

A comprehensive tool for football coaches and analysts to grade plays, track tendencies, and generate actionable insights by combining manual scouting data with official game statistics.

## 🏈 Features

### Core Functionality
- **Live Game Grading System**: Real-time play-by-play input during games with instant analytics
- **Sideline Interface**: Tablet-optimized grading interface for sideline use
- **Multi-User Coordination**: Multiple graders can work simultaneously with real-time sync
- **Offline Capability**: PWA with offline storage and auto-sync when reconnected
- **Film Study Mode**: Comprehensive analysis of recorded plays
- **Advanced Analytics**: Tendency analysis, formation effectiveness, and situational success rates
- **Formation Builder**: Interactive formation diagrams with drag-and-drop
- **Team Collaboration**: Multi-user access with role-based permissions
- **Data Integration**: NFL and NCAA data pipeline integration

### Grading System
- **Live Game Grading**: Quick +2 to -2 scale for real-time input during games
- **Detailed Grading**: Full 5-point scale for execution, technique, assignment, and impact
- **Situational Context**: Down/distance, red zone, goal-to-go analysis
- **Blitz & Coverage**: Comprehensive defensive scheme identification
- **Custom Tags**: Flexible tagging system for quick categorization
- **Voice Notes**: Voice recording capability for hands-free operation
- **Notes & Analysis**: Detailed play-by-play commentary

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Neon PostgreSQL (free tier) with Prisma ORM
- **Authentication**: NextAuth.js v5 with role-based access control
- **Deployment**: Vercel with automated CI/CD
- **Data Visualization**: Recharts and Tremor for analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL account (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/martyacryl/Prograde.git
   cd Prograde
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@host/prograde"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Data Integration APIs (Optional)
   KAGGLE_USERNAME="your_kaggle_username"
   KAGGLE_KEY="your_kaggle_api_key"
   ESPN_API_KEY="your_espn_api_key"
   SPORTS_REFERENCE_API_KEY="your_sports_reference_key"
   NCAA_API_BASE="http://localhost:3000"  # Default NCAA API endpoint
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🚀 Quick Start with Real Data

1. **Start NCAA API service** (optional but recommended):
   ```bash
   docker run -p 3000:3000 henrygd/ncaa-api
   ```

2. **Seed with external test data**:
   ```bash
   npm run seed:external
   ```

3. **Access Data Import Wizard**:
   Navigate to [http://localhost:3000/dashboard/data-import](http://localhost:3000/dashboard/data-import)

4. **Import Michigan vs Ohio State 2023**:
   - Use Game ID: `3146430`
   - Get 150+ real plays for testing
   - Test OL module with actual game scenarios

## 📁 Project Structure

```
prograde/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── (auth)/            # Authentication routes
│   │   ├── dashboard/         # Main application routes
│   │   ├── api/               # API endpoints
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── forms/            # Form components
│   │   ├── charts/           # Data visualization
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utility functions
│   │   ├── db.ts            # Database connection
│   │   ├── auth.ts          # Authentication config
│   │   ├── validations.ts   # Zod schemas
│   │   └── utils.ts         # Helper functions
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript definitions
│   └── data/                # Mock data and constants
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Database seeding
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🗄️ Database Schema

The application uses a comprehensive Prisma schema with the following key models:

- **User**: Coaches and analysts with role-based permissions
- **Team**: Football teams with conference and level information
- **Game**: Game metadata and scheduling
- **Play**: Individual play data with situational context
- **PlayGrade**: Detailed grading and analysis of plays
- **Formation**: Formation diagrams and personnel packages
- **Report**: Generated analysis reports and insights

## 🎯 Key Components

### PlayInputForm
The core component for inputting play data and grades. Features:
- Real-time form validation with Zod
- Quick-grade buttons (1-5 scale)
- Formation and personnel selection
- Blitz and coverage identification
- Custom tagging system
- Responsive design for tablet use

### Dashboard
Comprehensive overview with:
- Performance metrics and trends
- Recent game activity
- Quick action buttons
- Team collaboration status

### Live Grading Interface
Optimized for sideline use during games:
- **Sideline Grader**: Full-screen tablet interface with high contrast mode
- **Quick Play Input**: One-tap grading with +2 to -2 scale
- **Touch-friendly controls**: Extra large buttons for gloved hands
- **Voice recording**: Hands-free note taking
- **Real-time sync**: Multiple graders can work simultaneously
- **Offline capability**: PWA with local storage and auto-sync
- **Battery monitoring**: Power management for extended use
- **Stadium-ready**: High contrast mode for bright sunlight

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Data Import Scripts
- `npm run seed:external` - Seed database with external test data
- `npm run import:ncaa` - Import NCAA API data
- `npm run import:sample` - Import sample games
- `npm run validate:data` - Validate imported data quality
- `npm run seed:with-real-data` - Full seeding with real data

### Database Management
- `npx prisma studio` - Open Prisma Studio
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes
- `npx prisma db seed` - Seed with sample data

### Adding New Components
1. Create component in `src/components/`
2. Add to appropriate page in `src/app/`
3. Update navigation if needed
4. Add to storybook if applicable

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect Next.js and configure build settings
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

#### Vercel Configuration
- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 18.x

### Environment Variables
Required for production (set in Vercel dashboard):
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your Vercel domain URL

#### Setting up Environment Variables in Vercel:
1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable for Production, Preview, and Development environments
4. Redeploy after adding variables

## 📊 Data Integration

### NCAA Data Sources (Primary)
- **NCAA API Integration** - Real-time data from henrygd/ncaa-api
  - Self-host: `docker run -p 3000:3000 henrygd/ncaa-api`
  - Play-by-play: `GET /game/{gameId}/play-by-play`
  - Scoreboard: `GET /scoreboard/football/fbs/{season}/{week}/all-conf`
- **Test Games Available**:
  - Michigan vs Ohio State 2023 (Game ID: 3146430)
  - Alabama vs Georgia SEC Championship 2023
  - CFP Semifinal games with 100+ plays each

### Kaggle Datasets (Backup/Historical)
- College Football Game Stats 2002-2025
- College Football Statistics 2005-2013
- CSV upload and parsing support

### NFL Data Sources
- Snowflake Marketplace integration
- Official NFL play-by-play data
- Player statistics and performance metrics

### ESPN & Sports Reference
- ESPN API integration (requires API key)
- Sports Reference data (requires API key)
- Conference-specific statistics

### Data Import Features
- **Data Import Wizard** - User-friendly interface for all sources
- **Game Browser Interface** - Search, filter, and select games without knowing Game IDs
- **Team Selector** - Auto-complete team search with conference and ranking filters
- **Quick Import Collections** - Pre-curated game collections (rivalries, playoffs, championships)
- **Real-time Validation** - Data quality checks and mapping
- **Team Matching** - Fuzzy string matching for team names
- **Play Standardization** - Consistent format across sources
- **CSV Upload** - Direct file import support
- **Manual Entry** - Custom data input interface

## 🔐 Security Features

- Role-based access control (RBAC)
- Team data isolation
- Input validation with Zod schemas
- SQL injection prevention (Prisma ORM)
- XSS protection with CSP headers
- Rate limiting on API endpoints

## 📱 Mobile Optimization

- **Tablet-first design** for sideline use
- **Touch-friendly interface** for quick grading
- **Offline capabilities** for stadium use
- **Progressive Web App** features
- **Responsive layouts** for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Write comprehensive tests
- Update documentation as needed
- Follow the existing code style

## 📈 Roadmap

### Phase 1: MVP (Current)
- ✅ Basic play input interface
- ✅ Simple grading system
- ✅ Local data storage
- ✅ Basic analytics dashboard

### Phase 2: Data Integration (Q1 2025)
- ✅ NCAA API integration (henrygd/ncaa-api)
- ✅ Real-time play-by-play data import
- ✅ Test games with 100+ plays each
- ✅ Data validation and quality checks
- ✅ Live game grading system
- ✅ Real-time analytics engine
- 🔄 Enhanced analytics and mapping

### Phase 3: Advanced Features (Q2 2025)
- 📋 Team collaboration tools
- 📋 Advanced visualizations
- 📋 Mobile optimization
- 📋 Export/sharing capabilities

### Phase 4: AI & ML (Q3 2025)
- 🤖 Machine learning for tendency prediction
- 🤖 Computer vision for formation recognition
- 🤖 Natural language processing for notes
- 🤖 Predictive modeling for play success

## 📞 Support

- **Documentation**: [docs.prograde.com](https://docs.prograde.com)
- **Issues**: [GitHub Issues](https://github.com/martyacryl/Prograde/issues)
- **Discussions**: [GitHub Discussions](https://github.com/martyacryl/Prograde/discussions)
- **Email**: support@prograde.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database powered by [Neon](https://neon.tech/)
- Deployed on [Vercel](https://vercel.com/)

---

**ProGrade** - Transforming football analysis through data-driven insights.
