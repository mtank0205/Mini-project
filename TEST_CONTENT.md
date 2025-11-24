# 🧪 Testing Content for HackSim

## 1. 💻 CODE ANALYZER TESTS

### Test 1A: GOOD Code Example (Python)
**Select Language:** Python
**Paste this code:**
```python
def calculate_fibonacci(n: int) -> list:
    """
    Calculate Fibonacci sequence up to n terms.
    
    Args:
        n: Number of terms to generate
        
    Returns:
        List of Fibonacci numbers
    """
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    fib_sequence = [0, 1]
    for i in range(2, n):
        next_num = fib_sequence[i-1] + fib_sequence[i-2]
        fib_sequence.append(next_num)
    
    return fib_sequence

# Example usage
if __name__ == "__main__":
    result = calculate_fibonacci(10)
    print(f"First 10 Fibonacci numbers: {result}")
```
**Expected Result:** High score (75-85/100), good readability, proper documentation

---

### Test 1B: BAD Code Example (Python)
**Select Language:** Python
**Paste this code:**
```python
def f(x):
    a=[]
    a.append(0)
    a.append(1)
    for i in range(x):
        a.append(a[len(a)-1]+a[len(a)-2])
    return a

print(f(10))
```
**Expected Result:** Low score (30-45/100), poor readability, no documentation, bad naming

---

### Test 1C: LANGUAGE MISMATCH Test
**Select Language:** JavaScript
**Paste this Python code:**
```python
def hello_world():
    print("Hello, World!")
    
hello_world()
```
**Expected Result:** Language mismatch warning! "You selected JavaScript but the code appears to be Python"

---

### Test 1D: GOOD Code Example (JavaScript)
**Select Language:** JavaScript
**Paste this code:**
```javascript
/**
 * Validates an email address using regex pattern
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Validates a user registration form
 * @param {Object} userData - User data to validate
 * @returns {Object} - Validation result with errors
 */
function validateUserRegistration(userData) {
    const errors = [];
    
    if (!userData.username || userData.username.length < 3) {
        errors.push("Username must be at least 3 characters");
    }
    
    if (!validateEmail(userData.email)) {
        errors.push("Invalid email address");
    }
    
    if (!userData.password || userData.password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Example usage
const user = {
    username: "johndoe",
    email: "john@example.com",
    password: "SecurePass123"
};

console.log(validateUserRegistration(user));
```
**Expected Result:** High score (80-90/100), excellent structure and error handling

---

### Test 1E: BAD Code Example (JavaScript)
**Select Language:** JavaScript
**Paste this code:**
```javascript
function x(a,b,c){
var d=a+b
var e=d+c
return e
}
var result=x(1,2,3)
console.log(result)
```
**Expected Result:** Low score (25-40/100), no validation, poor naming, no error handling

---

## 2. 💡 IDEA EVALUATION TESTS

### Test 2A: GOOD Idea Example
**Problem Statement:**
```
Many students struggle to find affordable textbooks and academic resources. Used textbook marketplaces exist, but they lack verification, trust, and university-specific organization, leading to scams and wasted time.
```

**Proposed Idea:**
```
EduSwap - A university-focused peer-to-peer textbook exchange platform with built-in verification. Students can list, buy, or trade textbooks within their university community. Features include QR code verification for book authenticity, semester-based auto-listings, integrated payment with buyer protection, and a rating system for sellers.
```

**Features:**
```
QR code book verification, University email verification, In-app secure payments, Seller ratings and reviews, Push notifications for matches, Photo verification of book condition, Semester-based automatic listings, Price comparison with bookstores
```

**Tech Stack:**
```
React Native, Node.js, MongoDB, Stripe API, Firebase Cloud Messaging, AWS S3, Express.js
```

**Expected Result:** Score 65-75/100 - Good feasibility, clear problem, realistic scope

---

### Test 2B: BAD Idea Example
**Problem Statement:**
```
People forget things sometimes and need reminders.
```

**Proposed Idea:**
```
An AI-powered reminder app that uses machine learning to predict what you'll forget and reminds you automatically. It will use blockchain for security and has a social media feature where you can share reminders with friends.
```

**Features:**
```
AI predictions, Machine learning, Blockchain security, Social media integration, Dark mode, Push notifications, Cloud sync, Voice commands, AR reminders, Cryptocurrency rewards
```

**Tech Stack:**
```
React, Node.js, MongoDB, TensorFlow, Blockchain, Ethereum, AWS, AR Kit, ML Kit
```

**Expected Result:** Score 25-40/100 - Overdone idea, unrealistic scope, buzzwords without substance

---

### Test 2C: MEDIOCRE Idea Example
**Problem Statement:**
```
Hackathon teams often struggle with task management and real-time collaboration during the event.
```

**Proposed Idea:**
```
HackTrack - A simple task management tool specifically designed for hackathons. Teams can create projects, assign tasks, track progress, and share files all in one place with a 48-hour event timeline view.
```

**Features:**
```
Task boards, File sharing, Team chat, Progress tracking, Timer/countdown, GitHub integration
```

**Tech Stack:**
```
React, Node.js, Socket.io, MongoDB, AWS S3
```

**Expected Result:** Score 50-60/100 - Feasible but common, lacks innovation


---

## 3. 🔍 REPOSITORY EVALUATION TESTS

### Test 3A: GOOD Repository Example
**GitHub URL:**
```
https://github.com/facebook/react
```
**Why:** Large, well-maintained, excellent documentation, active community

**Expected Result:** High scores (80-90) across all metrics

---

### Test 3B: GOOD Repository Example (Medium-sized)
**GitHub URL:**
```
https://github.com/vercel/next.js
```
**Why:** Professional structure, comprehensive docs, good commit history

**Expected Result:** High scores (75-85) across metrics

---

### Test 3C: DECENT Repository Example
**GitHub URL:**
```
https://github.com/expressjs/express
```
**Why:** Well-known project with good structure

**Expected Result:** Moderate to high scores (70-80)

---

### Test 3D: Your Own Repository (If Available)
**GitHub URL:**
```
https://github.com/[your-username]/[your-repo]
```
**Why:** Test with your actual hackathon project

**Expected Result:** Varies based on actual repo quality

---

## 4. 🎯 COMPLETE WORKFLOW TEST

### Scenario: Building a Complete Hackathon Project

**Step 1: Evaluate Your Idea**
Use Test 2A (EduSwap) for a realistic idea evaluation

**Step 2: Analyze Your Code**
Start with Test 1D (Good JavaScript) to see good scores
Then try Test 1E (Bad JavaScript) to see the difference

**Step 3: Check Repository**
Use Test 3A or 3B to see what excellent repos look like

**Step 4: Compare Results**
- Good code should score 70-90/100
- Bad code should score 20-45/100
- Good ideas should score 60-80/100
- Bad ideas should score 25-45/100
- Good repos should score 75-90/100

---

## 5. 🚨 EDGE CASE TESTS

### Test 5A: Empty Code
**Select Language:** Any
**Paste:** (leave empty or just whitespace)
**Expected:** Error message or very low score

---

### Test 5B: Very Short Code
**Select Language:** Python
**Paste:**
```python
print("Hi")
```
**Expected:** Low score (30-40/100), lacks structure

---

### Test 5C: Code with Syntax Errors
**Select Language:** JavaScript
**Paste:**
```javascript
function test( {
    console.log("broken"
}
```
**Expected:** Should detect syntax errors, very low score

---

## 📊 EXPECTED SCORE RANGES

### Code Analyzer:
- **Excellent Code:** 80-95/100
- **Good Code:** 65-79/100
- **Average Code:** 45-64/100
- **Poor Code:** 25-44/100
- **Bad Code:** 0-24/100

### Idea Evaluation:
- **Innovative & Feasible:** 70-85/10
- **Good Idea:** 60-69/10
- **Average Idea:** 45-59/10
- **Weak Idea:** 30-44/10
- **Poor Idea:** 0-29/10

### Repository Analysis:
- **Professional Repo:** 80-95/10
- **Good Repo:** 65-79/10
- **Average Repo:** 50-64/10
- **Needs Work:** 30-49/10
- **Poor Repo:** 0-29/10

---

## ✅ TESTING CHECKLIST

- [ ] Test Code Analyzer with GOOD Python code (Test 1A)
- [ ] Test Code Analyzer with BAD Python code (Test 1B)
- [ ] Test Language Mismatch detection (Test 1C)
- [ ] Test Code Analyzer with GOOD JavaScript code (Test 1D)
- [ ] Test Code Analyzer with BAD JavaScript code (Test 1E)
- [ ] Test Idea Evaluation with GOOD idea (Test 2A)
- [ ] Test Idea Evaluation with BAD idea (Test 2B)
- [ ] Test Idea Evaluation with MEDIOCRE idea (Test 2C)
- [ ] Test Repository Analyzer with popular repo (Test 3A)
- [ ] Test edge cases (empty code, syntax errors)
- [ ] Verify language mismatch warnings appear correctly
- [ ] Check that scores are color-coded properly (green/yellow/red)
- [ ] Verify improvement suggestions are actionable
- [ ] Test on different screen sizes (mobile/desktop)

---

## 🎨 VISUAL CHECKS

When testing, verify:
1. ✅ Language mismatch shows RED warning banner
2. ✅ High scores (80+) appear in GREEN
3. ✅ Medium scores (50-79) appear in YELLOW/ORANGE
4. ✅ Low scores (0-49) appear in RED
5. ✅ Loading spinner appears during analysis
6. ✅ Results are clearly formatted and readable
7. ✅ Improvement suggestions are numbered and specific

---

## 🐛 KNOWN ISSUES TO WATCH FOR

1. If Llama doesn't respond: Check if Ollama is running (`ollama serve`)
2. If getting default scores: Model might not be returning proper JSON
3. If language detection fails: Try more obvious code examples
4. If analysis takes too long: Check backend terminal for errors

---

## 💡 TIPS FOR BEST TESTING

1. **Always check the backend terminal** for AI responses
2. **Test language mismatch first** - it's the most visible feature
3. **Compare good vs bad examples side-by-side** to see scoring differences
4. **Try your own code** after testing examples
5. **Test different programming languages** to ensure detection works
6. **Save screenshots** of good results for documentation

---

Good luck with testing! 🚀
