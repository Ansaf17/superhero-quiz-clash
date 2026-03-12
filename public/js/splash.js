setTimeout(() => {
  if (window.DamonFX) {
    window.DamonFX.navigate("home.html");
  } else {
    window.location.href = "home.html";
  }
}, 2300);