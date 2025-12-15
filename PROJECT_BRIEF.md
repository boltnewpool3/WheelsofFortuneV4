# Wheels of Fortune 2.0 - Project Brief

## Project Overview
This is a client-side web application for conducting a lucky draw contest called "Wheels of Fortune 2.0". The application allows an administrator to manage contestants, execute randomized draws, and track winners. The contest awards 3 prizes: 2 Pulsar NS 125 motorcycles and 1 TVS Jupiter scooter.

## Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom gradients and glassmorphism effects
- **Animations**: Framer Motion for smooth transitions and effects
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL) for draw results persistence
- **State Management**: React Context API + localStorage for hybrid data storage
- **Authentication**: Simple hardcoded credentials stored in AuthContext

## Authentication System

### Login Credentials
- **Username**: `admin`
- **Password**: `hgjikmnerDmAn@27Lz10`

### Implementation Details
- Located in: `src/contexts/AuthContext.tsx`
- Uses localStorage key `wheels_of_fortune_auth` to persist login state
- Protected routes via `src/components/ProtectedRoute.tsx`
- All pages except Login require authentication
- No logout expiration - session persists until manual logout

## Project Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication state management
├── components/
│   ├── Layout.tsx               # App shell with navigation
│   └── ProtectedRoute.tsx       # Route protection wrapper
├── pages/
│   ├── Login.tsx                # Login page
│   ├── Dashboard.tsx            # Statistics overview
│   ├── DrawArena.tsx            # Main draw execution page
│   ├── Contestants.tsx          # Contestant management
│   └── Winners.tsx              # Winner history display
├── services/
│   └── drawEngine.ts            # Core draw logic and Supabase operations
├── hooks/
│   ├── useLocalStorage.ts       # localStorage hook
│   └── useSupabase.ts           # Supabase client initialization
├── types/
│   └── index.ts                 # TypeScript type definitions
└── App.tsx                      # Main app with routing logic

public/
└── contest-data.json            # Contest configuration and contestant data
```

## Data Architecture

### 1. Contest Data (JSON File - Read Only)
**Location**: `/public/contest-data.json`

Contains the source of truth for:
- Contest name
- All contestants with their details (id, name, department, supervisor, tickets)
- Draw definitions (draw number and prize for each of 3 draws)

**Key Points**:
- Loaded via fetch API at runtime
- Each contestant has multiple unique ticket numbers
- Ticket numbers must be unique across all contestants
- This data is NOT modified by the app

### 2. Supabase Database (Persistent)
**Table**: `draws`

Stores the results of each draw execution:
```sql
- id (uuid, primary key)
- draw_number (integer, 1-3)
- prize (text, e.g., "Pulsar NS 125")
- winning_ticket (integer, nullable)
- winner_id (integer, nullable)
- winner_name (text, nullable)
- status (text: 'pending' or 'completed')
- drawn_at (timestamptz, nullable)
- created_at (timestamptz)
```

**Purpose**:
- Persists draw results across sessions
- Ensures draw integrity and prevents duplicate winners
- Single source of truth for which draws are completed

### 3. localStorage (Client-Side Cache)
**Keys Used**:
- `wheels_of_fortune_auth` - Authentication state
- `contestants` - Contestant management data (separate from draw contestants)
- `winners` - Winner tracking

**Note**: The Contestants and Winners pages use localStorage, but the DrawArena uses Supabase for persistence.

## Core Functionalities

### 1. Dashboard Page (`src/pages/Dashboard.tsx`)
**Purpose**: Overview and statistics display

**Features**:
- Displays 4 stat cards:
  - Total Contestants (from localStorage)
  - Total Winners (from localStorage)
  - Remaining Prizes
  - Success Rate calculation
- Shows recent 3 winners with details
- Progress bar showing draws completed (X/3)
- Prize status indicators (Awarded/Available for each prize)

**Data Sources**:
- Reads from `contestants` localStorage array
- Reads from `winners` localStorage array

### 2. Draw Arena (`src/pages/DrawArena.tsx`)
**Purpose**: Execute the lucky draw with visual effects

**Features**:
- Displays 3 draw cards showing draw number, status, prize, winner
- Spinning wheel animation during draw execution
- Winner announcement with celebration animation
- Draw statistics (total tickets, draws done, remaining)
- Real-time status updates

**Draw Execution Flow**:
1. Loads contest data from JSON file
2. Initializes 3 pending draws in Supabase (if not exists)
3. When "Start Draw" is clicked:
   - Fetches all completed draws from Supabase
   - Excludes tickets from previous winners
   - Randomly selects from remaining tickets
   - Finds contestant who owns the ticket
   - Updates Supabase with winner details
   - Shows animation and winner announcement

**Critical Logic** (`src/services/drawEngine.ts`):
- `getAvailableTickets()`: Filters out tickets from previous winners
- `selectRandomTicket()`: Pure random selection from available pool
- `findContestantByTicket()`: Maps ticket to contestant
- `executeDrawAndGetResults()`: Orchestrates entire draw process

**Data Flow**:
- Contest data: `/public/contest-data.json` (read-only)
- Draw results: Supabase `draws` table (persistent)
- Display data: Real-time queries from Supabase

### 3. Contestants Page (`src/pages/Contestants.tsx`)
**Purpose**: Manage participant database

**Features**:
- Add new contestants via modal form (name, email, phone)
- Search/filter contestants by name, email, or phone
- Delete contestants
- Visual indicator showing which contestants are winners
- Responsive table layout

**Data Storage**:
- Uses `contestants` localStorage key
- Separate from the contest-data.json contestants
- These are for management purposes, not the draw pool

**Important**: This contestant list is independent of the draw contestants in contest-data.json

### 4. Winners Page (`src/pages/Winners.tsx`)
**Purpose**: Historical record of winners

**Features**:
- Grid layout showing all winners with cards
- Winner details: name, email, phone, prize, date won
- Export functionality (downloads JSON file)
- Empty state with call-to-action
- Progress indicator for remaining prizes

**Data Source**:
- Reads from `winners` localStorage array

## Draw Engine Logic

### Algorithm Overview
The draw system ensures fairness and prevents duplicate winners:

1. **Initialization Phase**:
   - On app load, create 3 pending draws in Supabase
   - Each draw has a prize and draw_number

2. **Pre-Draw Phase**:
   - Load all contestants from JSON
   - Query Supabase for completed draws
   - Build list of winner IDs from completed draws
   - Filter out tickets belonging to previous winners
   - Result: Pool of eligible tickets

3. **Draw Execution**:
   - Random selection from eligible ticket pool
   - Lookup contestant who owns the ticket
   - Update Supabase draw record with:
     - Status: 'completed'
     - winning_ticket: selected ticket number
     - winner_id: contestant ID
     - winner_name: contestant name
     - drawn_at: current timestamp

4. **Post-Draw**:
   - Display winner with animation
   - Update UI to reflect completed draw
   - Next draw automatically excludes this winner

### Key Constraints
- Each contestant can only win once
- Once a contestant wins, all their tickets become ineligible
- Draw results persist in Supabase across sessions
- Random selection uses JavaScript Math.random()

## Design System

### Color Palette
- **Primary**: Cyan (#06b6d4) to Blue (#3b82f6) gradients
- **Secondary**: Yellow (#eab308) to Orange (#f97316) for winners
- **Success**: Green (#10b981) to Emerald (#059669)
- **Background**: Dark gray (#111827) to Black gradients
- **Surfaces**: Semi-transparent gray with backdrop blur (glassmorphism)

### Key Design Elements
- Glassmorphism cards (backdrop-blur-xl)
- Gradient borders and glows
- Smooth animations via Framer Motion
- Responsive breakpoints (sm, md, lg)
- Consistent 8px spacing system
- Rounded corners (xl, 2xl, 3xl)

### Animation Patterns
- Page transitions: opacity + y-axis slide
- Hover effects: scale (1.02-1.05)
- Tap effects: scale (0.95-0.98)
- Spinning wheel: continuous rotation during draw
- Winner reveal: scale + opacity + delayed children

## Environment Variables

Required in `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are used by `src/hooks/useSupabase.ts` to initialize the Supabase client.

## Navigation Structure

The app uses a custom client-side routing system via `useNavigation` hook:

- **Pages**: 'dashboard' | 'draw' | 'contestants' | 'winners'
- **Navigation**: Top navigation bar with icons and labels
- **Protected**: All pages require authentication except Login
- **State**: Managed via React useState in App.tsx

## Important Notes

### Data Separation
There are TWO separate contestant systems:
1. **Contest Contestants** (contest-data.json): Used for draws, read-only
2. **Managed Contestants** (localStorage): For management purposes, editable

These do not interact with each other.

### Draw Integrity
- Draw results stored in Supabase ensure persistence
- localStorage winners are derived from Supabase draw results
- Cannot execute more than 3 draws
- Previous winners are automatically excluded

### Limitations
- Hardcoded authentication (no user management)
- Client-side only (no backend API)
- Random selection uses Math.random() (not cryptographically secure)
- No email notifications to winners
- No audit trail beyond Supabase records

## Running the Application

```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env file with Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build
```

## Database Setup

The Supabase migration file creates the draws table:
- Location: `supabase/migrations/20251213021549_create_draws_table.sql`
- Creates draws table with RLS enabled
- Sets up policies for authenticated users

## Future Enhancement Ideas
- Email notifications to winners
- PDF certificate generation
- Admin dashboard for multiple contests
- User roles (admin, viewer)
- Draw history with replay capability
- Bulk contestant import via CSV
- Integration with actual contest-data.json for contestant management
- Real-time updates using Supabase subscriptions
- Mobile app version
- Print-friendly winner certificates

## Troubleshooting

### Draws not executing
- Check Supabase credentials in .env
- Verify draws table exists in Supabase
- Check browser console for errors
- Ensure user is authenticated

### Winners not showing
- Check if draws are marked as 'completed' in Supabase
- Verify localStorage is not disabled
- Check network tab for API errors

### Authentication issues
- Verify credentials match hardcoded values
- Clear localStorage and try again
- Check browser console for errors

---

This application demonstrates a clean separation of concerns with React best practices, type-safe TypeScript, modern UI/UX with animations, and reliable data persistence using Supabase.
