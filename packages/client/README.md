# BudgetMate - Smart Spending & Meal Recommendations

A modern, AI-powered budgeting and meal recommendation app that helps users track expenses and get personalized food suggestions based on their budget and preferences.

## Features

### 💰 **Smart Expense Tracking**
- Manual expense entry with categorization
- Receipt scanning with AI-powered data extraction  
- Real-time spending progress tracking
- Visual spending reports with charts and analytics

### 🍽️ **AI Meal Recommendations**
- Restaurant menu analysis
- Budget-based food suggestions
- Dietary preference matching (vegan, healthy, etc.)
- Calorie limit considerations
- Personalized dish recommendations with match scores

### 📊 **Financial Analytics**
- Monthly spending breakdown by category
- Interactive pie charts and bar graphs
- Spending trend analysis
- Savings rate calculations
- Goal progress tracking

### 🎯 **Personalization**
- Onboarding questionnaire for custom preferences
- Monthly budget and income tracking
- Savings goals with deadlines
- User profile management
- Spending style preferences

## App Flow

1. **Onboarding**: 3 intro slides + optional questionnaire
2. **Home Dashboard**: Spending overview + quick actions + meal recommendations
3. **Add Expense**: Manual entry or receipt upload with AI processing
4. **Reports**: Visual analytics and export options
5. **Recommendations**: Restaurant selection + AI meal suggestions
6. **Profile**: Edit preferences and financial settings

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui components
- **Charts**: Recharts for data visualization
- **Routing**: React Router
- **State**: React hooks + localStorage
- **Icons**: Lucide React

## Design System

- Modern fintech aesthetic with green/blue gradients
- Mobile-first responsive design
- HSL color system with semantic tokens
- Smooth animations and transitions
- Card-based layout with soft shadows

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   └── BottomNavigation.tsx
├── pages/
│   ├── IntroSlides.tsx
│   ├── Home.tsx
│   ├── Reports.tsx
│   ├── Recommendations.tsx
│   ├── AddExpense.tsx
│   ├── Questionnaire.tsx
│   └── Profile.tsx
├── assets/           # Generated images
├── lib/
└── hooks/
```

## Features in Detail

### Expense Tracking
- Categories: Food, Transport, Shopping, Entertainment, etc.
- Receipt AI: Automatically extracts merchant, amount, date
- Progress tracking against monthly budget
- Recent expenses list

### Meal Recommendations
- Restaurant menu integration
- Budget and calorie filtering
- Dietary preferences (vegan, healthy, spicy, etc.)
- AI-matched recommendations with scores
- Save selections as "Today's Recommendation"

### Reports & Analytics
- Category-wise spending pie charts
- Monthly trend bar charts
- Export to PDF/CSV
- Time period filtering (weekly, monthly, quarterly)

### User Experience
- Clean, intuitive mobile interface
- Smooth page transitions
- Toast notifications for user feedback
- Consistent bottom navigation
- Progressive disclosure of features

---

Built with ❤️ using React, TypeScript, and modern web technologies.