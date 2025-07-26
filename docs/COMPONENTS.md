# Components Documentation

## 📑 Table of Contents

- [🏠 Pages](#-pages)
  - [WelcomePage](#welcomepage)
  - [PledgePage](#pledgepage)
  - [HomePage](#homepage)
- [🎛️ Panels](#️-panels)
  - [DashboardPanel](#dashboardpanel)
  - [MissionsPanel](#missionspanel)
  - [ProfilePanel](#profilepanel)
  - [Header](#header)
  - [BottomMenu](#bottommenu)
- [🧩 Components](#-components)
  - [BudgetView](#budgetview)
  - [MissionCard](#missioncard)
  - [CheckBoxList](#checkboxlist)
  - [Calendar](#calendar)
  - [EntrySummary](#entrysummary)
  - [ExpensesTable](#expensestable)
  - [ProfileSettingsPanel](#profilesettingspanel)
  - [UserSwitcher](#userswitcher)
  - [OnboardingTester](#onboardingtester)
- [🔧 Utility Components](#-utility-components)
  - [App](#app)
  - [Root](#root)
  - [ErrorBoundary](#errorboundary)
  - [EnvUnsupported](#envunsupported)

---

## 🏠 Pages

### WelcomePage

**Location**: `src/pages/Welcome/WelcomePage.tsx`

**Purpose**: First page users see when opening the app. Handles onboarding flow and user welcome experience.

**Props**: None (uses hooks for data)

**State Management**:
- `displayedText`: Controls typing animation for subtitle
- `typingDone`: Tracks when typing animation completes
- `bounce`: Controls button bounce animation
- `isHovered`: Tracks button hover state
- `isClicked`: Tracks button click state

**Validation & Scenarios**:
- **Onboarding Check**: Redirects to `/home` if onboarding is already complete
- **User Data**: Falls back to "Squirrel" if no user first name available
- **Loading State**: Shows loading message while checking onboarding status
- **Error State**: Shows error message if onboarding check fails
- **Animation Timing**: 30ms per character for typing animation

**APIs Used**:
- `useOnboarding()` hook for onboarding status
- `completeStep(0, { completed_at: new Date().toISOString() })` to mark welcome step complete

**User Flow**:
1. Check if onboarding is complete → redirect to home if yes
2. Show welcome message with user's first name
3. Animate subtitle text typing effect
4. On button click, complete welcome step and navigate to pledge page
5. Handle errors gracefully with fallback navigation

**Key Features**:
- Personalized welcome with user's first name
- Smooth typing animation for subtitle
- Button hover and click animations
- Error handling with graceful fallbacks
- Automatic navigation based on onboarding status

---

### PledgePage

**Location**: `src/pages/Pledge/PledgePage.tsx`

**Purpose**: Second step in onboarding where users take a pledge to track expenses regularly.

**Props**: None (uses hooks for data)

**State Management**:
- `pledgeText`: User's typed pledge text
- `isTyping`: Tracks if user is currently typing
- `typingComplete`: Tracks if typing animation is done
- `showHint`: Controls hint visibility
- `isSubmitted`: Tracks if pledge has been submitted

**Validation & Scenarios**:
- **Pledge Validation**: Checks if user's text matches expected pledge
- **Typing Progress**: Tracks character-by-character typing
- **Completion Check**: Only allows submission when pledge is correctly typed
- **Error Handling**: Shows error states and allows retry

**APIs Used**:
- `useOnboarding()` hook for onboarding management
- `completeStep(1, { pledge_text: pledgeText, completed_at: new Date().toISOString() })` to complete pledge step

**User Flow**:
1. Show pledge text with typing animation
2. User types the pledge character by character
3. Validate each character matches expected text
4. On completion, submit pledge and navigate to home
5. Handle errors and allow retry

**Key Features**:
- Guided typing experience
- Real-time character validation
- Smooth typing animation
- Error handling with retry option
- Automatic navigation on completion

---

### HomePage

**Location**: `src/pages/Home/HomePage.tsx`

**Purpose**: Main application page that manages panel switching and overall app layout.

**Props**: None

**State Management**:
- `activePanel`: Current active panel ('missions', 'dashboard', 'add', 'profile', 'notifications')

**Panel Titles**:
- `missions`: "Missions"
- `dashboard`: "Dashboard" 
- `add`: "Add Expense"
- `profile`: "You"
- `notifications`: "Notifications"

**Validation & Scenarios**:
- **Panel Switching**: Handles navigation between different panels
- **Coming Soon Features**: Shows placeholder for unimplemented features (add expense, notifications)
- **Default Panel**: Sets 'profile' as default active panel

**Components Rendered**:
- `Header` with dynamic title based on active panel
- `MissionsPanel` when missions tab is active
- `DashboardPanel` when dashboard tab is active
- `ProfilePanel` when profile tab is active
- Placeholder content for add expense and notifications

**Key Features**:
- Central panel management
- Dynamic header titles
- Bottom navigation integration
- Placeholder handling for future features

---

## 🎛️ Panels

### DashboardPanel

**Location**: `src/panels/Dashboard/DashboardPanel.tsx`

**Purpose**: Main dashboard showing budget progress and expense data for the current month.

**Props**: None (uses Telegram SDK for data)

**State Management**:
- `budgetData`: Current month's budget and expense data
- `loadingBudget`: Loading state for budget data
- `budgetError`: Error state for budget requests
- `internalUserId`: Internal user ID from database
- `userIdLoading`: Loading state for user ID fetch
- `userIdError`: Error state for user ID fetch

**Validation & Scenarios**:
- **User Authentication**: Requires valid Telegram user data
- **Data Loading**: Shows loading states during API calls
- **Error Handling**: Displays error messages for failed requests
- **Fallback Values**: Uses default values when data is unavailable

**APIs Used**:
- `GET /api/user/:telegramId` - Get internal user ID
- `GET /api/user/:telegramId/budget/current-month` - Get budget data
- Uses `initDataRaw` for authentication headers

**Data Flow**:
1. Fetch internal user ID from Telegram ID
2. Load current month budget data
3. Pass data to BudgetView component
4. Render ExpensesTable if user ID is available

**Key Features**:
- Budget progress visualization
- Current month expense tracking
- Family budget support
- Error handling with user-friendly messages
- Loading states for better UX

---

### MissionsPanel

**Location**: `src/panels/Missions/MissionsPanel.tsx`

**Purpose**: Displays user's mission progress and gamification elements.

**Props**: None (uses Telegram SDK for data)

**State Management**:
- `missionProgress`: Current mission progress data
- `loading`: Loading state for mission data
- `error`: Error state for mission requests
- `showParsed`: Toggle for debug view
- `copySuccess`: Copy operation feedback

**Mission Definitions**:
- **Baby Steps**: Record expenses for 3+ days → Unlocks Calendar View
- **Junior Budget Analyst**: 7+ expense days + budget set → Unlocks Budget View

**Validation & Scenarios**:
- **User Authentication**: Requires valid Telegram user data
- **Progress Calculation**: Calculates completion percentages
- **Feature Unlocking**: Determines which features are unlocked
- **Error Debugging**: Provides detailed debug information

**APIs Used**:
- `GET /api/user/:telegramId/missions` - Get mission progress
- Uses `initDataRaw` for authentication headers

**Data Flow**:
1. Fetch mission progress from API
2. Calculate completion status for each mission
3. Render MissionCard components with progress data
4. Handle errors with debug information

**Key Features**:
- Mission progress tracking
- Visual progress indicators
- Feature unlocking system
- Detailed error debugging
- Copy debug info functionality

---

### ProfilePanel

**Location**: `src/panels/Profile/ProfilePanel.tsx`

**Purpose**: User profile management and settings.

**Props**: None (uses Telegram SDK for data)

**State Management**:
- Uses `useOnboarding()` hook for onboarding status
- Navigation state for different profile sections

**Validation & Scenarios**:
- **Onboarding Status**: Checks if user has completed onboarding
- **Navigation**: Handles routing to different profile sections
- **User Data**: Displays user information from Telegram

**Components Rendered**:
- `ProfileSettingsPanel` for user settings
- Onboarding completion status
- User information display

**Key Features**:
- User settings management
- Onboarding status display
- Profile information
- Settings panel integration

---

### Header

**Location**: `src/panels/HeaderMenu/Header.tsx`

**Purpose**: Top navigation header with app branding and dynamic title.

**Props**:
- `title?: string` - Optional title to display (defaults to 'Missions')

**Validation & Scenarios**:
- **Title Display**: Shows provided title or default
- **Responsive Design**: Adapts to different title lengths

**Key Features**:
- Squirrel mascot branding
- Dynamic title display
- Consistent styling across app
- Simple, clean design

---

### BottomMenu

**Location**: `src/panels/BottomMenu/BottomMenu.tsx`

**Purpose**: Bottom navigation menu for switching between app sections.

**Props**:
- `active: 'missions' | 'dashboard' | 'add' | 'profile' | 'notifications'` - Currently active tab
- `onMenuSelect: (panel) => void` - Callback for tab selection

**Menu Items**:
- **Missions**: 🦫 Squirrel icon, always enabled
- **Dashboard**: 📅 Calendar icon, always enabled  
- **Add**: ➕ Plus icon, currently disabled
- **You**: 👤 User icon, always enabled
- **Notifications**: 🔔 Bell icon, currently disabled

**Validation & Scenarios**:
- **Active State**: Highlights currently selected tab
- **Disabled Items**: Shows disabled state for unavailable features
- **Icon Rendering**: Renders appropriate icons for each tab
- **Center Button**: Special styling for add button

**Key Features**:
- Visual tab indicators
- Disabled state handling
- Custom icon rendering
- Center button design
- Active state highlighting

---

## 🧩 Components

### BudgetView

**Location**: `src/components/BudgetView/BudgetView.tsx`

**Purpose**: Displays budget progress with visual indicators and warnings.

**Props**:
- `totalExpenses: number` - Total expenses for current month
- `budget: number | null` - Monthly budget amount
- `currentDate: number` - Current day of month
- `daysInMonth: number` - Total days in current month
- `budgetPercentage: number` - Percentage of budget used
- `datePercentage: number` - Percentage of month elapsed
- `isFamily?: boolean` - Whether this is a family budget
- `familyMembers?: number` - Number of family members

**Validation & Scenarios**:
- **No Budget**: Shows message to set budget if none exists
- **Over Budget**: Displays warning when budget is exceeded
- **Progress Colors**: Changes color based on budget status
- **Family Budget**: Shows family-specific messaging

**Key Features**:
- Visual progress bar
- Budget vs date comparison
- Over-budget warnings
- Family budget support
- Currency formatting (₹)

---

### MissionCard

**Location**: `src/components/MissionCard/MissionCard.tsx`

**Purpose**: Individual mission display with progress tracking and completion status.

**Props**:
- `id: string` - Mission identifier
- `title: string` - Mission title
- `description: string` - Mission description
- `icon: string` - Mission icon
- `progress: number` - Current progress value
- `target: number` - Target value for completion
- `isCompleted: boolean` - Whether mission is completed
- `isUnlocked: boolean` - Whether mission is unlocked
- `budgetSet?: boolean` - Whether budget is set (for Junior Analyst)
- `descriptionItems?: Array<{text: string, completed: boolean}>` - Detailed task list

**State Management**:
- `isExpanded: boolean` - Controls expanded/collapsed state
- `isPressed: boolean` - Tracks button press state

**Validation & Scenarios**:
- **Progress Calculation**: Calculates completion percentage
- **Visual States**: Different styling for completed/unlocked/locked
- **Expandable Content**: Shows detailed tasks when expanded
- **Squirrel Images**: Different images based on mission type

**Key Features**:
- Expandable mission details
- Progress bar visualization
- Completion badges
- Squirrel mascot integration
- Interactive animations

---

### CheckBoxList

**Location**: `src/components/MissionCard/CheckBoxList.tsx`

**Purpose**: Displays a list of checkboxes for mission task breakdown.

**Props**:
- `items: Array<{text: string, completed: boolean}>` - List of tasks with completion status

**Validation & Scenarios**:
- **Task Display**: Shows each task with completion status
- **Visual Feedback**: Checked/unchecked states
- **Text Wrapping**: Handles long task descriptions

**Key Features**:
- Checkbox list display
- Completion status indicators
- Clean, readable layout

---

### Calendar

**Location**: `src/components/CalendarView/Calendar.tsx`

**Purpose**: Monthly calendar view showing expense entry dates.

**Props**:
- `year: number` - Calendar year
- `month: number` - Calendar month (1-12)
- `expenseDates: number[]` - Array of days with expenses
- `onDateClick?: (date: number) => void` - Optional date click handler

**Validation & Scenarios**:
- **Date Range**: Validates year and month values
- **Expense Highlighting**: Highlights days with expense entries
- **Current Day**: Shows current day indicator
- **Month Navigation**: Handles different month lengths

**APIs Used**:
- `GET /api/user/:telegramId/calendar/:year/:month` - Get expense dates for month

**Key Features**:
- Monthly calendar grid
- Expense date highlighting
- Current day indicator
- Interactive date selection
- Responsive design

---

### EntrySummary

**Location**: `src/components/CalendarView/EntrySummary.tsx`

**Purpose**: Shows summary of expenses for a selected date.

**Props**:
- `date: number` - Selected date
- `expenses: Array<{amount: number, category: string}>` - Expenses for the date
- `onClose: () => void` - Close handler

**Validation & Scenarios**:
- **Data Display**: Shows expense details for selected date
- **Empty State**: Handles dates with no expenses
- **Category Grouping**: Groups expenses by category

**Key Features**:
- Date-specific expense summary
- Category grouping
- Total calculation
- Modal-style display

---

### ExpensesTable

**Location**: `src/components/TableView/ExpensesTable.tsx`

**Purpose**: Displays expense data in a table format.

**Props**:
- `userId: number` - Internal user ID
- `initDataRaw: string` - Telegram init data for authentication

**State Management**:
- `expenses: Array` - Expense data
- `loading: boolean` - Loading state
- `error: string | null` - Error state

**Validation & Scenarios**:
- **Authentication**: Requires valid init data
- **Data Loading**: Shows loading states
- **Error Handling**: Displays error messages
- **Empty State**: Handles no expense data

**APIs Used**:
- `GET /api/user/:internalUserId/expenses/current-month` - Get current month expenses
- Uses `initDataRaw` for authentication

**Key Features**:
- Tabular expense display
- Date and amount formatting
- Loading and error states
- Responsive table design

---

### ProfileSettingsPanel

**Location**: `src/panels/Profile/ProfileSettingsPanel.tsx`

**Purpose**: User settings management interface.

**Props**:
- `userId: number` - Internal user ID
- `initDataRaw: string` - Telegram init data for authentication

**State Management**:
- `monthStart: string` - Month start day setting
- `loading: boolean` - Loading state
- `saving: boolean` - Save operation state
- `error: string | null` - Error state
- `success: boolean` - Success state

**Validation & Scenarios**:
- **Settings Validation**: Validates month start day (1-28)
- **Save Operations**: Handles settings updates
- **Error Handling**: Shows error messages
- **Success Feedback**: Confirms successful saves

**APIs Used**:
- `GET /api/user/:telegramId/settings` - Get user settings
- `POST /api/user/:telegramId/settings` - Update user settings

**Key Features**:
- Month start day configuration
- Settings persistence
- Validation feedback
- Success/error messaging

---

### UserSwitcher

**Location**: `src/components/DevTools/UserSwitcher.tsx`

**Purpose**: Development tool for switching between test users.

**Props**:
- `onUserChange: (user: any) => void` - Callback when user changes

**State Management**:
- `selectedUserId: number` - Currently selected user ID

**Validation & Scenarios**:
- **Development Only**: Only shows in development mode
- **Test Users**: Uses configured test user list
- **Local Storage**: Persists selected user
- **Page Reload**: Reloads page when user changes

**Key Features**:
- Test user selection
- Development environment detection
- Local storage persistence
- Automatic page reload

---

### OnboardingTester

**Location**: `src/components/DevTools/OnboardingTester.tsx`

**Purpose**: Development tool for testing onboarding flows.

**Props**: None

**State Management**:
- Uses `useOnboarding()` hook for onboarding data

**Validation & Scenarios**:
- **Development Only**: Only shows in development mode
- **Onboarding Status**: Shows current onboarding progress
- **Step Management**: Allows manual step completion
- **Progress Reset**: Enables resetting onboarding progress

**Key Features**:
- Onboarding progress display
- Manual step completion
- Progress reset functionality
- Development environment detection

---

## 🔧 Utility Components

### App

**Location**: `src/components/App.tsx`

**Purpose**: Main app component that handles routing and theme.

**Props**: None

**State Management**:
- Uses Telegram SDK for theme and platform detection

**Key Features**:
- Route configuration
- Theme integration
- Platform-specific styling
- Error boundary integration

---

### Root

**Location**: `src/components/Root.tsx`

**Purpose**: Root component with error boundary and development tools.

**Props**: None

**State Management**:
- `handleUserChange` - Callback for user switching

**Key Features**:
- Error boundary wrapper
- Development tools integration
- User switcher integration

---

### ErrorBoundary

**Location**: `src/components/ErrorBoundary.tsx`

**Purpose**: Catches and displays React errors gracefully.

**Props**:
- `fallback: React.ComponentType<{error: Error}>` - Error display component
- `children: React.ReactNode` - Child components

**State Management**:
- `hasError: boolean` - Error state
- `error: Error | null` - Error object

**Key Features**:
- Error catching
- Graceful error display
- Error reporting
- Component recovery

---

### EnvUnsupported

**Location**: `src/components/EnvUnsupported.tsx`

**Purpose**: Shows when the app is opened outside of Telegram.

**Props**: None

**Key Features**:
- Environment detection
- User-friendly error message
- Telegram integration requirement
- Clear instructions

---

*Last Updated: 26 July 2025*
*Version: 1.0* 