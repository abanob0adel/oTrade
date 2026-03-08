# Subscription-Based Content Access Update

## Overview
Updated all content modules to check user subscriptions from the Subscription collection instead of relying on JWT token data. Content now unlocks automatically based on active subscriptions.

## Changes Made

### 1. Routes Updated
Added `optionalAuthenticate` middleware to public GET endpoints:

- **Courses** (`src/modules/courses/courses.routes.js`)
  - `GET /:id` - Already had optionalAuthenticate
  - `GET /:courseId/lessons` - Already had optionalAuthenticate
  - `GET /:courseId/lessons/:lessonId` - Already had optionalAuthenticate

- **Psychology** (`src/modules/psychology/psychology.routes.js`)
  - `GET /` - Added optionalAuthenticate
  - `GET /:id` - Added optionalAuthenticate

- **Analysis** (`src/modules/analysis/analysis.routes.js`)
  - `GET /` - Added optionalAuthenticate
  - `GET /:id` - Added optionalAuthenticate

- **Books** (`src/modules/books/books.routes.js`)
  - `GET /` - Added optionalAuthenticate
  - `GET /:id` - Added optionalAuthenticate

- **Webinars** (`src/modules/webinars/webinars.routes.js`)
  - `GET /` - Added optionalAuthenticate
  - `GET /:id` - Added optionalAuthenticate

- **Strategies** (`src/modules/strategies/strategies.routes.js`)
  - Already had optionalAuthenticate (reference implementation)

### 2. Controllers Updated
Updated `getById` functions to check subscriptions from Subscription collection:

#### Courses (`src/modules/courses/courses.controller.js`)
- `getCourseById`: Updated to check Subscription collection
- Returns 403 with locked status if user not subscribed
- Compares course.plans with userSubscription.planId

#### Psychology (`src/modules/psychology/psychology.controller.js`)
- `getPsychologyById`: Updated to check Subscription collection
- Returns 403 with locked status if user not subscribed
- Compares psychology.plans with userSubscription.planId

#### Analysis (`src/modules/analysis/analysis.controller.js`)
- `getAnalysisById`: Updated to check Subscription collection
- Returns 403 with locked status if user not subscribed
- Compares analysis.plans with userSubscription.planId

#### Strategies (`src/modules/strategies/strategies.controller.js`)
- `getStrategyById`: Already implemented (reference pattern)

#### Books
- No changes needed - all books are free

#### Webinars
- No changes needed - webinars are public

## Subscription Check Pattern

All paid content now follows this pattern:

```javascript
// 1. Check if content is free
if (!content.isPaid) {
  return res.status(200).json({ /* full content */ });
}

// 2. Check if user is authenticated
if (!req.user) {
  return res.status(403).json({
    error: 'Access denied',
    message: 'This content requires an active subscription',
    locked: true
  });
}

// 3. Admin bypass
if (isAdmin) {
  return res.status(200).json({ /* full content */ });
}

// 4. Check active subscription
const Subscription = (await import('../subscriptions/subscription.model.js')).default;
const userSubscription = await Subscription.findOne({
  userId: req.user._id,
  status: 'active'
});

let hasAccess = false;
if (userSubscription && userSubscription.planId) {
  hasAccess = content.plans.some(planId =>
    planId.toString() === userSubscription.planId.toString()
  );
}

// 5. Return based on access
if (hasAccess) {
  return res.status(200).json({ /* full content, locked: false */ });
}

return res.status(403).json({
  error: 'Access denied',
  message: 'You need to subscribe to a plan that includes this content',
  locked: true,
  requiredPlans: content.plans
});
```

## Response Format

### Unlocked Content (Free or Subscribed)
```json
{
  "id": "...",
  "title": "...",
  "description": "...",
  "content": "...",
  "videoUrl": "...",
  "locked": false
}
```

### Locked Content (Not Subscribed)
```json
{
  "error": "Access denied",
  "message": "You need to subscribe to a plan that includes this content",
  "content": {
    "id": "...",
    "title": "...",
    "description": "...",
    "locked": true
  },
  "requiredPlans": ["planId1", "planId2"]
}
```

## Benefits

1. **Automatic Unlocking**: Content unlocks automatically when user subscribes
2. **Real-time Access**: No need to re-login after subscription
3. **Single Source of Truth**: Subscription collection is the authority
4. **Consistent Behavior**: All content modules follow same pattern
5. **Better UX**: Clear error messages with required plans

## Testing

Test each content type:
1. Access as unauthenticated user (should see locked)
2. Access as authenticated user without subscription (should see locked)
3. Access as authenticated user with subscription (should see unlocked)
4. Access as admin (should always see unlocked)

## Modules Covered

✅ Strategies
✅ Courses (including lessons)
✅ Psychology
✅ Analysis
✅ Books (all free, no checks needed)
✅ Webinars (public, no checks needed)
✅ Market Analysis (public, no checks needed)
