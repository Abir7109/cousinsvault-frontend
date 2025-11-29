# Cousins Memory Vault - Login Information

## Main Admin Account (Pre-created)

| Field       | Value                    |
|-------------|--------------------------|
| **Name**    | Abir Hasan              |
| **Email**   | rahikulmakhtum147@gmail.com |
| **Username**| Abir                    |
| **Password**| abirbd@#                |
| **Role**    | admin                   |

## Auto-Detection System for Family Members

The system automatically detects when Rubab or Rahi signs up and assigns them appropriate roles and profiles:

### Rubab Ahmed Auto-Detection
**Triggers when signup contains:**
- Name: "rubab", "ruba", "rubaab" (case-insensitive)
- Username: "rubab", "ruba", "rubaab" (case-insensitive)  
- Email: contains "rubab", "ruba", "rubaab"

**Auto-assigned:**
- Role: `admin`
- Bio: "Creative graphic designer with a passion for visual storytelling and family memories."
- Automatically linked to family tree

**Example usernames that will be detected:**
- rubab, Rubab, RUBAB
- rubab123, rubab_designer
- ruba, ruba_ahmed
- Any variation with these names

### Rahi Ahmed Auto-Detection
**Triggers when signup contains:**
- Name: "rahi", "raahi", "rahee" (case-insensitive)
- Username: "rahi", "raahi", "rahee" (case-insensitive)
- Email: contains "rahi", "raahi", "rahee"

**Auto-assigned:**
- Role: `contributor` 
- Bio: "Aspiring writer and poet who loves capturing life moments through words."
- Automatically linked to family tree

**Example usernames that will be detected:**
- rahi, Rahi, RAHI
- rahi123, rahi_writer
- raahi, rahee
- Any variation with these names

## How It Works

1. When a user signs up, the system checks their name, username, and email
2. If patterns match Rubab or Rahi, they get:
   - Pre-defined role and bio
   - Email automatically verified
   - Linked to their family tree entry
   - Welcome message identifying them as family

3. Other users get default `contributor` role

## Database Structure

- **Users Table**: Stores only Abir initially
- **Family Members Table**: Contains Rubab and Rahi as unlinked entries
- **Auto-linking**: When detected users sign up, their user account links to family tree

## Security Notes

- All passwords are bcrypt hashed
- JWT tokens for session management
- Email verification (auto-verified for family)
- Activity logging for security tracking