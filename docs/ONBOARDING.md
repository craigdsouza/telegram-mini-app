# Onboarding Flow Documentation

## Table of Contents
1. [Quickstart Guide](#quickstart-guide)
2. [Detailed Implementation](#detailed-implementation)

---

## Quickstart Guide

### Adding a New Onboarding Step

To add a new onboarding step, follow these 3 simple steps:

#### Step 1: Create the Page Component
Create a new page component in `src/pages/`:

```typescript
// src/pages/NewStep/NewStepPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import './NewStepPage.css';

export const NewStepPage: React.FC = () => {
  const navigate = useNavigate();
  const { completeStep } = useOnboarding();

  const handleComplete = async () => {
    await completeStep(2, { completed_at: new Date().toISOString() });
    navigate('/home'); // or next step
  };

  return (
    <div className="new-step-root">
      {/* Your step content */}
      <button onClick={handleComplete}>Complete Step</button>
    </div>
  );
};
```

#### Step 2: Add Route
Add the route in `src/navigation/routes.tsx`:

```typescript
import { NewStepPage } from '@/pages/NewStep/NewStepPage';

export const routes: Route[] = [
  { path: '/', Component: WelcomePage },
  { path: '/home', Component: HomePage, title: 'Home' },
  { path: '/pledge', Component: PledgePage, title: 'Take the Pledge' },
  { path: '/new-step', Component: NewStepPage, title: 'New Step' }, // Add this
];
```

#### Step 3: Configure the Step
Add the step configuration in `src/config/onboarding.ts`:

```typescript
export const ONBOARDING_STEPS: OnboardingStep[] = [
  // ... existing steps
  {
    id: 2, // Next available ID
    key: 'new-step',
    title: 'New Step',
    description: 'Description of the new step',
    component: 'NewStepPage',
    required: true,
    skipable: false,
    estimatedTime: 30
  }
];
```

#### Step 4: Update Database Default (if needed)
If this changes the total number of steps, update the database default:

```sql
-- Run this SQL or create a migration
ALTER TABLE users 
ALTER COLUMN onboarding_progress 
SET DEFAULT '{"current_step": 0, "completed_steps": [], "total_steps": 3, "step_data": {}}';
```

### Testing Your New Step

1. **Reset onboarding** using the DevTools component (only visible in dev mode)
2. **Navigate through the flow** to test your new step
3. **Check the database** to verify progress is saved correctly

---

## Detailed Implementation

### Architecture Overview

The onboarding system uses a **centralized configuration** approach with **database persistence** and **React hooks** for state management.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Configuration  │    │   Database      │
│                 │    │                  │    │                 │
│ • React Pages   │◄──►│ • ONBOARDING_    │◄──►│ • JSONB Column  │
│ • useOnboarding │    │   STEPS          │    │ • Progress      │
│ • Navigation    │    │ • Step Config    │    │   Tracking      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components

#### 1. Configuration (`src/config/onboarding.ts`)

**Purpose**: Central source of truth for all onboarding steps.

```typescript
export interface OnboardingStep {
  id: number;           // Unique step identifier
  key: string;          // Human-readable key
  title: string;        // Display title
  description: string;  // Step description
  component: string;    // Route/component name
  required: boolean;    // Must be completed
  skipable: boolean;    // Can be skipped
  estimatedTime?: number; // Estimated completion time
}

export interface OnboardingProgress {
  current_step: number;     // Current step ID
  completed_steps: number[]; // Array of completed step IDs
  total_steps: number;      // Total number of steps
  step_data: Record<string, any>; // Step-specific data
}
```

**Key Functions**:
- `isOnboardingComplete()`: Checks if all required steps are done
- `getProgressPercentage()`: Calculates completion percentage
- `getStepById()`: Retrieves step configuration by ID

#### 2. React Hook (`src/hooks/useOnboarding.ts`)

**Purpose**: Manages onboarding state and API interactions.

```typescript
export interface OnboardingStatus {
  loading: boolean;
  error: string | null;
  progress: OnboardingProgress | null;
  currentStep: number;
  isComplete: boolean;
  progressPercentage: number;
  checkProgress: () => Promise<void>;
  completeStep: (stepId: number, stepData?: any) => Promise<void>;
  goToStep: (stepId: number) => Promise<void>;
}
```

**Key Features**:
- **Automatic progress checking** on component mount
- **Error handling** with retry logic
- **Loading states** for better UX
- **Step completion** with optional data

#### 3. Database Schema

**Table**: `users`
**Column**: `onboarding_progress` (JSONB)

```json
{
  "current_step": 1,
  "completed_steps": [0],
  "total_steps": 2,
  "step_data": {
    "step_0": {
      "completed_at": "2025-07-24T13:03:01.687Z"
    },
    "step_1": {
      "pledge_text": "I pledge, to act always...",
      "completed_at": "2025-07-24T13:05:30.123Z"
    }
  }
}
```

### API Endpoints

#### GET `/api/user/:telegramId/onboarding`
**Purpose**: Retrieve user's onboarding progress

**Response**:
```json
{
  "onboarding": {
    "current_step": 1,
    "completed_steps": [0],
    "total_steps": 2,
    "step_data": { ... }
  }
}
```

#### POST `/api/user/:telegramId/onboarding`
**Purpose**: Update onboarding progress

**Actions**:
- `complete`: Mark a step as completed
- `skip`: Mark a step as skipped
- `update`: Update progress data
- `reset`: Reset to initial state

**Request Body**:
```json
{
  "action": "complete",
  "step": 1,
  "stepData": {
    "pledge_text": "user input",
    "completed_at": "2025-07-24T13:05:30.123Z"
  }
}
```

### Navigation Flow

#### Automatic Navigation Logic

1. **Welcome Page** (`/`):
   - Checks if onboarding is complete → redirects to `/home`
   - If not complete → shows welcome content
   - On completion → navigates to next step (`/pledge`)

2. **Pledge Page** (`/pledge`):
   - Shows pledge content with guided typing
   - On completion → navigates to `/home`

3. **Home Page** (`/home`):
   - Main application dashboard
   - Only accessible after onboarding completion

#### Route Protection

```typescript
// In WelcomePage.tsx
useEffect(() => {
  if (isComplete) {
    navigate('/home');
  }
}, [isComplete, navigate]);
```

### Step Implementation Patterns

#### Pattern 1: Simple Step (Welcome)
```typescript
const handleButtonClick = async () => {
  await completeStep(0, { completed_at: new Date().toISOString() });
  navigate('/pledge');
};
```

#### Pattern 2: Interactive Step (Pledge)
```typescript
const handleSubmit = async () => {
  if (pledgeText === expectedPledge) {
    await completeStep(1, { 
      pledge_text: pledgeText,
      completed_at: new Date().toISOString() 
    });
    navigate('/home');
  }
};
```

#### Pattern 3: Conditional Step
```typescript
const handleComplete = async () => {
  const stepData = {
    user_choice: selectedOption,
    completed_at: new Date().toISOString()
  };
  
  await completeStep(stepId, stepData);
  
  // Navigate based on user choice
  if (selectedOption === 'option_a') {
    navigate('/path-a');
  } else {
    navigate('/path-b');
  }
};
```

### Development Tools

#### OnboardingTester Component
**Location**: `src/components/DevTools/OnboardingTester.tsx`
**Purpose**: Development-only component for testing onboarding flow

**Features**:
- Reset onboarding to beginning
- Complete all steps at once
- Navigate to specific steps
- Display current progress

**Usage**: Only visible in development mode (`import.meta.env.DEV`)

### Database Migrations

#### Migration Pattern
```python
# Example: Adding new onboarding step
def update_onboarding_steps():
    # Update existing users
    cur.execute("""
        UPDATE users 
        SET onboarding_progress = jsonb_set(
            onboarding_progress, 
            '{total_steps}', '3'
        )
        WHERE onboarding_progress->>'total_steps' = '2';
    """)
    
    # Update default for new users
    cur.execute("""
        ALTER TABLE users 
        ALTER COLUMN onboarding_progress 
        SET DEFAULT '{"current_step": 0, "completed_steps": [], "total_steps": 3, "step_data": {}}';
    """)
```

### Error Handling

#### Frontend Error Handling
```typescript
const { loading, error, completeStep } = useOnboarding();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

const handleComplete = async () => {
  try {
    await completeStep(stepId, stepData);
    navigate('/next-step');
  } catch (error) {
    console.error('Failed to complete step:', error);
    // Show user-friendly error message
  }
};
```

#### API Error Handling
```javascript
// In telegram-api/index.js
app.post('/api/user/:telegramId/onboarding', async (req, res) => {
  try {
    // Validate input
    if (typeof action !== 'string' || !['complete', 'skip', 'reset', 'update'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    // Process request
    const result = await processOnboardingAction(telegramId, action, req.body);
    
    res.json({ success: true, user: result });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Performance Considerations

#### Optimizations
1. **Lazy Loading**: Onboarding pages are loaded only when needed
2. **Caching**: Progress is cached in React state
3. **Debouncing**: API calls are debounced to prevent spam
4. **Error Recovery**: Automatic retry on network failures

#### Monitoring
```typescript
// Log onboarding events for analytics
console.log('🎯 [ONBOARDING] Step completed:', {
  stepId,
  stepData,
  timestamp: new Date().toISOString()
});
```

### Testing Strategy

#### Unit Tests
- Test step configuration validation
- Test progress calculation functions
- Test navigation logic

#### Integration Tests
- Test API endpoints
- Test database migrations
- Test complete onboarding flow

#### Manual Testing
- Use DevTools for rapid iteration
- Test with different user states
- Test error scenarios

### Future Enhancements

#### Potential Improvements
1. **A/B Testing**: Different onboarding flows for different user segments
2. **Analytics**: Track completion rates and drop-off points
3. **Personalization**: Customize steps based on user preferences
4. **Offline Support**: Cache progress for offline completion
5. **Multi-language**: Support for different languages

#### Scalability Considerations
- **Step Dependencies**: Allow steps to depend on previous step data
- **Conditional Steps**: Show/hide steps based on user data
- **Dynamic Configuration**: Load step config from API
- **Progressive Enhancement**: Add features based on user capabilities 