# Project ideas

Each idea lists suggested models (≥ 3, with relations) and HTMX interactions. Scale the scope to your team size.

### 1. Book club
- **Models:** `User`, `Book`, `Club`, `Membership` (User–Club N–M with role), `Review`
- **HTMX:** star rating without reload, active search of books, infinite scroll of reviews, join/leave club button

### 2. Gym class booking
- **Models:** `User`, `Trainer`, `Class`, `Session` (time slot), `Booking`
- **HTMX:** live "places left" counter (polling `every 10s`), book/cancel inline, filter by day
- **Extra:** a transaction prevents overbooking

### 3. Recipe manager
- **Models:** `User`, `Recipe`, `Ingredient`, `RecipeIngredient` (explicit N–M with quantity), `Tag`
- **HTMX:** dynamic ingredient rows in the form, tag filter, "scale servings" fragment

### 4. Lab equipment rental
- **Models:** `User`, `Item`, `Category`, `Loan`, `Reservation`
- **HTMX:** availability calendar fragment, inline return confirmation, search by category
- **Extra:** roles (student/admin) and authorization rules

### 5. Personal finance tracker
- **Models:** `User`, `Account`, `Category`, `Transaction`, `Budget`
- **HTMX:** inline add transaction with OOB balance update, month switcher, CSV export link
- **Extra:** aggregates with `groupBy`, charts rendered server-side as SVG

### 6. Conference planner
- **Models:** `User`, `Event`, `Talk`, `Speaker`, `Room`, `Favourite`
- **HTMX:** star a talk, schedule grid filtered by track, speaker modal loaded on demand

### 7. Issue tracker (Task board++)
- **Models:** `User`, `Project`, `Issue`, `Comment`, `Label`, `ProjectMember`
- **HTMX:** comments without reload, status changes, assignee picker, mentions autocomplete
- Must clearly go beyond the reference app (members, comments, permissions).

### 8. Student marketplace
- **Models:** `User`, `Listing`, `Category`, `Message`, `Favourite`
- **HTMX:** active search with filters, favourite toggle, message thread polling
- **Extra:** image upload with `multipart/form-data` parsed by hand (bonus)

### 9. Quiz platform
- **Models:** `User`, `Quiz`, `Question`, `Answer`, `Attempt`
- **HTMX:** one-question-at-a-time flow, timer, results fragment, leaderboard polling

### 10. Volunteer shift scheduler
- **Models:** `User`, `Organisation`, `Shift`, `Signup`, `Skill`
- **HTMX:** sign-up/withdraw buttons, filter by skill, OOB update of the "my shifts" sidebar
