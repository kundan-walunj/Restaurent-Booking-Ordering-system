const signinbtn = document.querySelector('#sub');
const form = document.querySelector('#signinform');
form.addEventListener('submit', handleFormSubmit)

async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    let url = "http://localhost:3000/";

    try {
      const formData = new FormData(form);
      console.log("Form Data", formData);
      const responseData = await postFormDataAsJson({ url, formData });

      console.log({ responseData });
      window.event.returnValue = false;
      location.href = "localhost:5500/public/wtlass1.html"
    } catch (error) {
      console.error(error);
    }
  }
async function postFormDataAsJson({ url, formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJsonString = JSON.stringify(plainFormData);
    console.log(formDataJsonString);

    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: formDataJsonString,
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }

    return response.json();
  }
