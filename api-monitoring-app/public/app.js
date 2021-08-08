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
    xhr.setRequestHeader("token", app.config.sessionToken);
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

// Bind the forms
app.bindForms = function () {
  document.querySelector("form").addEventListener("submit", function (e) {
    //Stoping from submitting and getting the settings of the form
    e.preventDefault();
    const formId = this.id;
    const path = this.action;
    const method = this.method.toUpperCase();

    //Hide the error message (if its currently shown due to a previous error)
    const formErrorMessage = document.getElementById("form__fromError");
    formErrorMessage.style.display = "hidden";

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
        console.log(
          "DEBBUGG line 102, check input values: " +
            element.name +
            " - " +
            valueOfInput,
          element.type
        ); //@TODO delete this line
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
};

// form response processor
app.formResposeProcessor = function (formId, payload, responsePayload) {
  let functionToCall = false;
  if (formId === "accountCreate") {
    //@TODO some logic when receiving a form from a sign up
    console.log("DEBBUG line 134", responsePayload);
  }
};

// INIT BOOTSTRAPPING
app.init = function () {
  //Bind all form submissions
  app.bindForms();
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
  const contractCheckerPhone = phone.value.length === 11 && phone.value.match(valoresAceptados)

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

const DEFAULT_RESPONSE = {
  404: "Not Found Error. (dafault message)",
  403: "Operation Forbidden, normally happens when credentials are needed like a loggedin user. (dafault message)",
  405: "Invalid Method. (dafault message)",
  400: "Missing required data. (dafault message)",
};
