/**
 * Front end logic
 *
 */

const app = {};

//AJAX Client (for the restful API)
app.client = {};

//CONFIG
app.config = {
  sessionToken: false,
};

//interface for making API calls
app.client.request = function (
  headers,
  path,
  method,
  queryStringObject,
  payload,
  callback
) {
  //CHECKER
  const validMethods = ["POST", "GET", "PUT", "DELETE"];
  //Set defaults
  headers = typeof headers == "object" && headers !== null ? headers : {};
  path = typeof path == "string" ? path : "/";
  method =
    typeof method == "string" && validMethods.includes(method.toUpperCase())
      ? method.toUpperCase()
      : "GET";

  queryStringObject =
    typeof queryStringObject == "object" && queryStringObject !== null
      ? queryStringObject
      : {};
  payload = typeof payload == "object" && payload !== null ? payload : {};
  callback = typeof callback == "function" ? callback : false;

  //For each queryString parameter sent, add it to the path
  let requestUrl = path + "?";
  let counter = 0;
  for (const queryKey in queryStringObject) {
    if (Object.hasOwnProperty.call(queryStringObject, queryKey)) {
      counter++;
      //If at least on query string parameter has been passed, prepend new ones with the &
      if (counter > 1) {
        requestUrl += "&";
      }
      // Add the key value
      requestUrl += queryKey + "=" + queryStringObject[queryKey];
    }
  }

  //Form http request as a JSON type
  const xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  //For each header sent, add it to the request
  for (const key in headers) {
    if (Object.hasOwnProperty.call(headers, key)) {
      xhr.setRequestHeader(key, headers[key]);
    }
  }

  //If there is a current session token set, add that as a header
  if (app.config.sessionToken) {
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  //When the request comes back, handle the response
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const statuCode = xhr.status;
      const responseReturned = xhr.responseText;

      //callback if requested
      if (callback) {
        try {
          const parsedResponse = JSON.parse(responseReturned);
          callback(statuCode, parsedResponse);
        } catch (error) {
          callback(statuCode, error);
        }
      }
    }
  };
  // Send the payload as json
  const payloadString = JSON.stringify(payload);
  xhr.send(payloadString);
};

// BIND LOGOUT BTN
app.bindLogoutButton = function () {
  document
    .getElementById("logout__btn")
    .addEventListener("click", function (e) {
      // Stop redirecting
      e.preventDefault();

      //Log the user out
      app.logUserOut();
    });
};

//Log out user and redirect
app.logUserOut = function () {
  //get the current tokenID
  const tokenId =
    typeof app.config.sessionToken.id == "string"
      ? app.config.sessionToken.id
      : "";
  //Prepare the queryStringObject
  const queryStringObject = {
    id: tokenId,
  };
  //send the request DELETE to api/tokens
  app.client.request(
    undefined,
    "api/tokens",
    "DELETE",
    queryStringObject,
    undefined,
    function (statusCode, responseData) {
      //Set the app.token to false
      app.setSessionToken(false);
      //Redirect to logged out page
      window.location = "/session/deleted";
    }
  );
};

// Bind the forms
app.bindForms = function () {
  if (document.querySelector("form")) {
    const allForms = document.querySelectorAll("form");
    for (var i = 0; i < allForms.length; i++) {
      allForms[i].addEventListener("submit", function (e) {

        //Stoping from submitting and getting the settings of the form
        e.preventDefault();
        const formId = this.id;
        const path = this.action;
        const method = this.attributes.method.value;
        //Hide the error message (if its currently shown due to a previous error)
        const formErrorMessage = document.querySelector(
          "#" + formId + " .form__fromError"
        );
        formErrorMessage.style.display = "none";
        // Hide the success message (if it's currently shown due to a previous error)
        if (document.querySelector("#" + formId + " .form__fromSucces")) {
          document.querySelector(
            "#" + formId + " .form__fromSucces"
          ).style.display = "none";
        }

        //Turn the inputs into a payload
        const payload = {};
        const elements = this.elements;
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          // todo input menos el boton

          if (
            element.type !== "submit" &&
            element.type !== "fieldset" &&
            element.name !== "confirmPassword"
          ) {
            const valueOfInput =
              element.type == "checkbox" ? element.checked : element.value;
            payload[element.name] = valueOfInput;
          }
        }

        //Call the API
        app.client.request(
          undefined,
          path,
          method,
          undefined,
          payload,
          function (statusCode, responsePayload) {
            //Display an error on the form if needed
            if (statusCode !== 200) {
              // try to get the error from the API
              const errorMessage =
                typeof responsePayload.Error == "string"
                  ? responsePayload.Error
                  : DEFAULT_RESPONSE[statusCode];

              //Set the error Message field with the error text
              formErrorMessage.innerHTML = errorMessage;

              //show or unhide the error
              formErrorMessage.style.display = "block";
              // if there is no error
            } else {
              app.formResposeProcessor(formId, payload, responsePayload);
            }
          }
        );
      });
    }
  }
};
// form response processor
app.formResposeProcessor = function (formId, requestPayload, responsePayload) {
  let functionToCall = false;
  if (formId === "accountCreate") {
    //take the phone and password, and use it to log in the user automaticly
    const newPayload = {
      phone: requestPayload.phone,
      password: requestPayload.password,
    };

    app.client.request(
      undefined,
      "api/tokens",
      "POST",
      undefined,
      newPayload,
      function (statusCode, responseData) {
        if (statusCode !== 200) {
          // Set the formError field with the Error text
          const formErrorMessage = document.getElementById(
            "#" + formId + " .form__fromError"
          );
          formErrorMessage.innerHTML = "Internal Error, Please try again.";
          formErrorMessage.style.display = "block";
        } else {
          // succesful log in
          app.setSessionToken(responseData);
          window.location = "/checks/all";
        }
      }
    );
  }
  // For login form do this:
  if (formId === "sessionCreate") {
    //As login was succesful, set the new sessionToken
    app.setSessionToken(responsePayload);
    window.location = "/checks/all";
  }

  // For Edit Account Forms
  const formsWithSuccesMessages = ["accountEdit1", "accountEdit2"];
  if (formsWithSuccesMessages.includes(formId)) {
    document.querySelector("#" + formId + " .form__fromSucces").style.display =
      "block";
  }
};

// get session token from coockies
app.getSessionToken = function () {
  //try to get it from local storage
  const tokenString = localStorage.getItem("token");
  //if exists
  if (typeof tokenString == "string") {
    try {
      const token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if (token && typeof token == "object") {
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    } catch (e) {
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

//Set or remove loggedIn class from the body
app.setLoggedInClass = function (booleanAdd) {
  const target = document.querySelector("body");
  if (booleanAdd) {
    target.classList.add("loggedIn");
  } else {
    target.classList.remove("loggedIn");
  }
};

//Set a new sessionToken to the localStorage
app.setSessionToken = function (token) {
  app.config.sessionToken = token;
  const tokenString = JSON.stringify(token);
  localStorage.setItem("token", tokenString);
  if (token && typeof token == "object") {
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

//Loop renewing the token
app.tokenRenewalLoop = function () {
  setInterval(function () {
    //@TODO renewToken
    app.renewToken(function (err) {
      if (!err) {
        console.log("Token renewd successfully at ", Date.now());
      }
    });
  }, 1000 * 120);
};

// Renew the token
app.renewToken = function (callback) {
  const currentToken =
    typeof app.config.sessionToken == "object"
      ? app.config.sessionToken
      : false;
  if (currentToken) {
    // Update the token with a new expiration
    const payload = {
      id: currentToken.id,
      extend: true,
    };
    app.client.request(
      undefined,
      "api/tokens",
      "PUT",
      undefined,
      payload,
      function (statusCode, responsePayload) {
        // Display an error on the form if needed
        if (statusCode == 200) {
          // Get the new token details
          const queryStringObject = { id: currentToken.id };
          app.client.request(
            undefined,
            "api/tokens",
            "GET",
            queryStringObject,
            undefined,
            function (statusCode, responsePayload) {
              // Display an error on the form if needed
              if (statusCode == 200) {
                app.setSessionToken(responsePayload);
                callback(false);
              } else {
                app.setSessionToken(false);
                callback(true);
              }
            }
          );
        } else {
          app.setSessionToken(false);
          callback(true);
        }
      }
    );
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// Load data on the page
app.loadDataOnPage = function () {
  // Get the current page from the body class
  const bodyClasses = document.querySelector("body").classList;
  const primaryClass =
    typeof bodyClasses[0] == "string" ? bodyClasses[0] : false;
  // Logic for account settings page
  if (primaryClass == "settings") {
    app.loadAccountEditPage();
  }
};

// Load the account edit page specifically
app.loadAccountEditPage = function () {
  // Get the phone number from the current token, or log the user out if none is there
  const phone =
    typeof app.config.sessionToken.phone == "string"
      ? app.config.sessionToken.phone
      : false;
  const tokenID =
    typeof app.config.sessionToken.id == "string"
      ? app.config.sessionToken.id
      : false;
  if (phone && tokenID) {
    // Fetch the user data
    const queryStringObject = {
      phone: phone,
    };

    app.client.request(
      undefined,
      "api/users",
      "GET",
      queryStringObject,
      undefined,
      function (statusCode, responsePayload) {
        if (statusCode == 200) {
          // Put the data into the forms as values where needed
          document.querySelector("#accountEdit1 .firstNameInput").value =
            responsePayload.firstName;
          document.querySelector("#accountEdit1 .lastNameInput").value =
            responsePayload.lastName;
          document.querySelector("#accountEdit1 .displayPhoneInput").value =
            responsePayload.phone;

          // Put the hidden phone field into both forms
          const hiddenPhoneInputs = document.querySelectorAll(
            "input.hiddenPhoneNumberInput"
          );
          for (let i = 0; i < hiddenPhoneInputs.length; i++) {
            hiddenPhoneInputs[i].value = responsePayload.phone;
          }
        } else {
          // If the request comes back as something other than 200, log the user out (on the assumption that the api is temporarily down or the users token is bad)
          app.logUserOut();
        }
      }
    );
  } else {
    app.logUserOut();
  }
};

// INIT BOOTSTRAPPING
app.init = function () {
  //Bind all form submissions
  app.bindForms();
  //bind logout button
  app.bindLogoutButton();
  // Get the token from localstorage
  app.getSessionToken();

  // Renew token
  app.tokenRenewalLoop();

  // Load data on page
  app.loadDataOnPage();
};

// CALL the init processes after the window loads
window.onload = function () {
  app.init();
};
/**
 * BURGUER BTN TOGGLE
 */
const handleMenuBtnClick = () => {
  const menu = document.getElementsByClassName("menu")[0];
  menu.classList.toggle("open");
};

/**
 * handling the signup btn disabled
 */
const handleSignUpButton = () => {
  // ONCHANGE

  const button = document.getElementById("form__button");
  const password1 = document.getElementsByName("password")[0];
  const password2 = document.getElementsByName("confirmPassword")[0];
  const firstName = document.getElementsByName("firstName")[0];
  const lastName = document.getElementsByName("lastName")[0];
  const tosAgreement = document.getElementsByName("tosAgreement")[0];
  const phone = document.getElementsByName("phone")[0];
  const span = document.getElementById("form__validPassword");
  const phonespan = document.getElementById("form__validPhone");
  //checks for the phone
  const valoresAceptados = /^[0-9]+$/;
  const contractCheckerPhone =
    phone.value.length === 11 && phone.value.match(valoresAceptados);

  if (
    password1.value !== "" &&
    password2.value !== "" &&
    password1.value === password2.value &&
    firstName.value !== "" &&
    lastName.value !== "" &&
    tosAgreement.checked &&
    contractCheckerPhone
  ) {
    button.disabled = false;
  } else {
    button.disabled = true;
  }

  if (
    password1.value !== "" &&
    password2.value !== "" &&
    password1.value === password2.value
  ) {
    span.style.visibility = "visible";
  } else {
    span.style.visibility = "hidden";
  }
  if (contractCheckerPhone) {
    phonespan.style.visibility = "visible";
  } else {
    phonespan.style.visibility = "hidden";
  }
};
// handle the btn in log in session
const handleLogInButton = () => {
  const button = document.getElementById("form__button");
  const password1 = document.getElementsByName("password")[0];
  const phone = document.getElementsByName("phone")[0];

  //checks for the phone
  const valoresAceptados = /^[0-9]+$/;
  const contractCheckerPhone =
    phone.value.length === 11 && phone.value.match(valoresAceptados);
  // enabling disabling the log in button
  if (contractCheckerPhone && password1.value !== "") {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
};
// handle the btn in UPDATE NAMES
const handleUpdateNameButton = () => {
  const button = document.getElementById("updateNameBtn");
  const firstName = document.getElementsByName("firstName")[0].value;
  const lastName = document.getElementsByName("lastName")[0].value;

  // enabling disabling the log in button
  if (firstName !== "" || lastName !== "") {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
};
// handle the btn in UPDATE NAMES
const handleUpdatePasswordButton = () => {
  const button = document.getElementById("updatePasswordBtn");
  const password = document.getElementsByName("password")[0].value;
  const confirmPassword =
    document.getElementsByName("confirmPassword")[0].value;

  // enabling disabling the log in button
  if (
    password !== "" &&
    confirmPassword !== "" &&
    password === confirmPassword
  ) {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
};

const DEFAULT_RESPONSE = {
  404: "Not Found Error. (dafault message)",
  403: "Operation Forbidden, normally happens when credentials are needed like a loggedin user. (dafault message)",
  405: "Invalid Method. (dafault message)",
  400: "Missing required data. (dafault message)",
};
