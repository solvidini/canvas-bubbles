const optionsToggler = document.querySelector("div.options__toggler");
const options = document.querySelector("#options");

optionsToggler.addEventListener("click", (event) => {
  const target = event.target;
  const closed = /--closed/;

  if (closed.test(target.className)) {
    target.classList.remove("options__toggler--closed");
    target.setAttribute("title", "Hide options");
    options.classList.remove("options--closed");
  } else {
    target.classList.add("options__toggler--closed");
    target.setAttribute("title", "Show options");
    options.classList.add("options--closed");
  }
});
