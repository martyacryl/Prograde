# ProGrade - Football Play Analysis Platform

A comprehensive tool for football coaches and analysts to grade plays, track tendencies, and generate actionable insights by combining manual scouting data with official game statistics.

## 🏈 Features

### Core Functionality
- **Live Play Grading**: Real-time play-by-play input during games
- **Film Study Mode**: Comprehensive analysis of recorded plays
- **Advanced Analytics**: Tendency analysis, formation effectiveness, and situational success rates
- **Formation Builder**: Interactive formation diagrams with drag-and-drop
- **Team Collaboration**: Multi-user access with role-based permissions
- **Data Integration**: NFL and NCAA data pipeline integration

### Grading System
- **5-Point Scale**: Execution, technique, assignment, and impact ratings
- **Situational Context**: Down/distance, red zone, goal-to-go analysis
- **Blitz & Coverage**: Comprehensive defensive scheme identification
- **Custom Tags**: Flexible tagging system for quick categorization
- **Notes & Analysis**: Detailed play-by-play commentary

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Neon PostgreSQL (free tier) with Prisma ORM
- **Authentication**: NextAuth.js v5 with role-based access control
- **Deployment**: Netlify with automated CI/CD
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
- Touch-friendly controls
- Quick data entry
- Real-time validation
- Offline capability

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

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

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Configure environment variables
5. Deploy automatically on push to main branch

### Environment Variables
Required for production:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Your domain URL

## 📊 Data Integration

### NFL Data Sources
- Snowflake Marketplace integration
- Official NFL play-by-play data
- Player statistics and performance metrics

### NCAA Data Sources
- ESPN API integration
- Sports Reference data
- Conference-specific statistics

### Custom Data Import
- CSV upload functionality
- Manual data entry interface
- Data validation and cleaning

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
- 🔄 NFL/NCAA data pipeline
- 🔄 Play mapping algorithms
- 🔄 Enhanced analytics

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
- Deployed on [Netlify](https://netlify.com/)

---

**ProGrade** - Transforming football analysis through data-driven insights.
