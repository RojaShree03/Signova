const $ = (id) => document.getElementById(id);

const validEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const setValid = (input) => {
    input?.classList.remove("input-invalid");
    input?.classList.add("input-valid");
};

const setInvalid = (input) => {
    input?.classList.remove("input-valid");
    input?.classList.add("input-invalid");
};

const clearState = (input) => {
    input?.classList.remove("input-valid", "input-invalid");
};

// TOAST
const showToast = (message, type = "success") => {

    const toast = $("toast");

    if (!toast) return;

    $("toastMessage").textContent = message;
    $("toastIcon").textContent = type === "success" ? "✓" : "!";

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
};

// LOCAL STORAGE
const getUsers = () => {
    try {
        return JSON.parse(localStorage.getItem("signovaUsers") ?? "[]");
    } catch {
        return [];
    }
};

const saveUsers = (users) => {
    localStorage.setItem("signovaUsers", JSON.stringify(users));
};

// MOBILE MENU
const menuButton = $("mobileMenuButton") || $("menuButton");
const mobileMenu = $("mobileMenu");

menuButton?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("hidden");
});

document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => {
        mobileMenu?.classList.add("hidden");
    });
});

// PASSWORD SHOW / HIDE
const passwordToggle = (inputId, buttonId) => {

    const input = $(inputId);
    const button = $(buttonId);

    button?.addEventListener("click", () => {

        const show = input.type === "password";

        input.type = show ? "text" : "password";
        button.textContent = show ? "🙈" : "👁";

    });
};

passwordToggle("registerPassword", "registerPasswordToggle");
passwordToggle("loginPassword", "loginPasswordToggle");

// REGISTER
const registerForm = $("registerForm");

if (registerForm) {

    const name = $("registerName");
    const email = $("registerEmail");
    const password = $("registerPassword");
    const terms = $("terms");
    const button = $("registerButton");

    const nameError = $("nameError");
    const emailError = $("emailError");
    const passwordError = $("passwordError");
    const strengthText = $("passwordStrengthText");

    let nameValid = false;
    let emailValid = false;
    let passwordValid = false;


    // Name Validation
    const checkName = () => {

        const value = name.value.trim();

        if (!value) {
            nameError.textContent = "Name is required.";
            setInvalid(name);
            nameValid = false;
            return;
        }

        if (value.length < 2) {
            nameError.textContent = "Name must contain at least 2 characters.";
            setInvalid(name);
            nameValid = false;
            return;
        }
        nameError.textContent = "";
        setValid(name);
        nameValid = true;
    };

    // Email Validation
    const checkEmail = () => {
        const value = email.value.trim();
        if (!value) {
            emailError.textContent = "Email is required.";
            setInvalid(email);
            emailValid = false;
            return;
        }
        if (!validEmail(value)) {
            emailError.textContent = "Please enter a valid email.";
            setInvalid(email);
            emailValid = false;
            return;
        }
        emailError.textContent = "";
        setValid(email);
        emailValid = true;
    };


    // Password Validation + Strength
    const checkPassword = () => {

        const value = password.value;

        if (!value) {
            passwordError.textContent = "Password is required.";
            strengthText.textContent = "—";
            strengthText.className = "text-slate-500";
            setInvalid(password);
            passwordValid = false;
            return;
        }

        if (value.length < 6) {
            passwordError.textContent = "Password must contain at least 6 characters.";
            setInvalid(password);
            passwordValid = false;
        } else {
            passwordError.textContent = "";
            setValid(password);
            passwordValid = true;
        }

        // Password Strength
        let score = 0;

        if (value.length >= 6) score++;
        if (value.length >= 8) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        if (score <= 1) {
            strengthText.textContent = "Weak";
            strengthText.className = "text-red-400";
        } else if (score <= 3) {
            strengthText.textContent = "Medium";
            strengthText.className = "text-yellow-400";
        } else {
            strengthText.textContent = "Strong";
            strengthText.className = "text-green-400";
        }
    };

    // Enable / Disable Button
    const updateButton = () => {

        button.disabled =
            !(nameValid &&
              emailValid &&
              passwordValid &&
              terms.checked);
    };

    // Real-Time Validation

    name.addEventListener("input", () => {
        checkName();
        updateButton();
    });
    email.addEventListener("input", () => {
        checkEmail();
        updateButton();
    });
    password.addEventListener("input", () => {
        checkPassword();
        updateButton();
    });

    terms.addEventListener("change", updateButton);

    // Register Submit
    registerForm.addEventListener("submit", (event) => {

        event.preventDefault();

        checkName();
        checkEmail();
        checkPassword();
        updateButton();

        if (!nameValid || !emailValid || !passwordValid || !terms.checked) {
            showToast("Please complete the form correctly.", "error");
            return;
        }
        const users = getUsers();
        const userEmail = email.value.trim().toLowerCase();


        // Duplicate Email
        if (users.some((user) => user.email === userEmail)) {
            emailError.textContent = "Email is already registered.";
            setInvalid(email);
            showToast("Email is already registered.", "error");
            return;
        }

        // Create User

        users.push({
            id: crypto.randomUUID(),
            name: name.value.trim(),
            email: userEmail,
            password: password.value
        });

        saveUsers(users);

        showToast("Account created successfully!");

        registerForm.reset();

        clearState(name);
        clearState(email);
        clearState(password);

        nameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";

        strengthText.textContent = "—";
        strengthText.className = "text-slate-500";

        nameValid = false;
        emailValid = false;
        passwordValid = false;

        updateButton();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

    });
}

// LOGIN

const loginForm = $("loginForm");

if (loginForm) {
    const email = $("loginEmail");
    const password = $("loginPassword");
    const button = $("loginButton");
    const emailError = $("loginEmailError");
    const passwordError = $("loginPasswordError");
    const remember = $("rememberMe");
    let emailValid = false;
    let passwordValid = false;

    // Check Email
    const checkEmail = () => {

        const value = email.value.trim();

        if (!value) {
            emailError.textContent = "Email is required.";
            setInvalid(email);
            emailValid = false;
            return;
        }

        if (!validEmail(value)) {
            emailError.textContent = "Please enter a valid email.";
            setInvalid(email);
            emailValid = false;
            return;
        }
        emailError.textContent = "";
        setValid(email);
        emailValid = true;
    };

    // Check Password
    const checkPassword = () => {

        const value = password.value;

        if (!value) {
            passwordError.textContent = "Password is required.";
            setInvalid(password);
            passwordValid = false;
            return;
        }

        if (value.length < 6) {
            passwordError.textContent =
                "Password must contain at least 6 characters.";

            setInvalid(password);
            passwordValid = false;
            return;
        }
        passwordError.textContent = "";
        setValid(password);
        passwordValid = true;
    };

    // Update Button
    const updateButton = () => {

        button.disabled = !(emailValid && passwordValid);

    };

    // Remembered Email
    const savedEmail =
        localStorage.getItem("signovaRememberedEmail");

    if (savedEmail) {
        email.value = savedEmail;
        checkEmail();
        updateButton();
    }

    // Real-Time Validation
    email.addEventListener("input", () => {
        checkEmail();
        updateButton();
    });

    password.addEventListener("input", () => {
        checkPassword();
        updateButton();
    });

    // Remember Me
    remember.addEventListener("change", () => {
        if (!remember.checked) {
            localStorage.removeItem("signovaRememberedEmail");
        }
    });

    // Login Submit
    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        checkEmail();
        checkPassword();
        updateButton();

        if (!emailValid || !passwordValid) {
            showToast("Please enter valid credentials.", "error");
            return;
        }

        const userEmail = email.value.trim().toLowerCase();
        const user = getUsers().find(
            (item) =>
                item.email === userEmail &&
                item.password === password.value
        );

        // Invalid Login
        if (!user) {
            passwordError.textContent = "Invalid email or password.";
            setInvalid(password);
            showToast("Invalid email or password.", "error");
            return;
        }

        // Remember Email
        if (remember.checked) {

            localStorage.setItem(
                "signovaRememberedEmail",
                userEmail
            );
        }

        const session = {
            id: user.id,
            name: user.name,
            email: user.email,
            loginTime: new Date().toISOString()
        };

        if (remember.checked) {
            localStorage.setItem(
                "signovaSession",
                JSON.stringify(session)
            );
        } else {
            sessionStorage.setItem(
                "signovaSession",
                JSON.stringify(session)
            );
        }

        showToast(`Welcome back, ${user.name}!`);
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);
    });

    // Forgot Password
    $("forgotPassword")?.addEventListener("click", () => {
        showToast(
            "Password recovery is not available in this demo.",
            "error"
        );
    });

}