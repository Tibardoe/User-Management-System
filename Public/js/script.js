function handleClick(button) {
    const $button = $(button);
    const loginForm = $(".login-card");
    const signupForm = $(".signup-card");
    const resetForm = $(".reset-card");

    if ($button.hasClass("login")) {
        loginForm.show();
        signupForm.hide();
    }
    else if ($button.hasClass("signUp")) {
        signupForm.show();
        loginForm.hide();
    }

    else if ($button.hasClass("forgot")) {
        resetForm.show();
        loginForm.hide();
    }

    else if ($button.hasClass("to-signup")) {
        signupForm.show();
        loginForm.hide();
    }

    else if ($button.hasClass("to-login")) {
        loginForm.show();
        signupForm.hide();
    }

    else if ($button.hasClass("cancel")) {
        loginForm.hide();
        signupForm.hide();
        resetForm.hide();
    }
};