// 1. Create the button securely
const createButton = () => {
    // Prevent creating multiple buttons if the script runs twice
    if (document.getElementById("spam-check-btn")) return;

    const btn = document.createElement("button");
    btn.id = "spam-check-btn";
    btn.innerHTML = "🔍 Check Spam";
    
    // Styling to make it look nice and float in the bottom right
    Object.assign(btn.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "9999",
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        fontSize: "14px",
        fontWeight: "bold"
    });

    // Add hover effect
    btn.onmouseover = () => btn.style.backgroundColor = "#0056b3";
    btn.onmouseout = () => btn.style.backgroundColor = "#007bff";

    // Attach the click event
    btn.onclick = checkSpam;
    
    document.body.appendChild(btn);
};

// 2. The Main Logic
async function checkSpam() {
    const btn = document.getElementById("spam-check-btn");
    
    // A. GET TEXT (The Robust Way)
    // Priority 1: Use text the user has highlighted (100% reliable)
    let emailText = window.getSelection().toString();

    // Priority 2: If nothing highlighted, try to find Gmail's email body
    if (!emailText) {
        // '.a3s' and '.ii' are common classes for email bodies in Gmail
        const bodyElement = document.querySelector('.a3s') || document.querySelector('.ii');
        if (bodyElement) {
            emailText = bodyElement.innerText;
        }
    }

    // B. VALIDATION
    if (!emailText || emailText.trim().length === 0) {
        alert("⚠️ Please open an email OR highlight the text you want to check!");
        return;
    }

    // C. SEND TO SERVER (With Error Handling)
    try {
        // Change button text to show it's working
        btn.innerHTML = "⏳ Scanning...";
        btn.disabled = true;

        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: emailText })
        });

        // Check if server responded with an error (e.g., 500 or 404)
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();

        // D. DISPLAY RESULT
        if (data.is_spam === 1) {
            alert("🚨 WARNING: This message is classified as SPAM!");
            btn.style.backgroundColor = "#dc3545"; // Red
            btn.innerHTML = "🚨 Spam Detected";
        } else {
            alert("✅ This message looks SAFE.");
            btn.style.backgroundColor = "#28a745"; // Green
            btn.innerHTML = "✅ Safe";
        }

    } catch (error) {
        // 1. Log the error to the console (F12) so you can see it
        console.error("Spam Check Error:", error);

        // 2. Alert the user
        alert("❌ Error: Could not connect to the Spam Detector.\n\nMake sure your Python 'api.py' is running!");

        // 3. Update the button to show failure
        const btn = document.getElementById("spam-check-btn");
        if (btn) {
            btn.innerHTML = "❌ Connection Failed";
            btn.style.backgroundColor = "#6c757d"; // Grey
        }
    } finally {
        // Reset button after 3 seconds
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = "🔍 Check Spam";
            btn.style.backgroundColor = "#007bff";
        }, 3000);
    }
}

// 3. Initialize properly
// We use a timeout to ensure Gmail has finished loading its scripts
setTimeout(createButton, 2000);
