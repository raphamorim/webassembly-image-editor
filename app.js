const input = document.querySelector("input");

input.onchange = (event) => {
  const selectedFile = event.target.files[0];
  const reader = new FileReader();

  const imgtag = document.getElementById("myimage");
  imgtag.title = selectedFile.name;

  reader.onload = (event) => {
    imgtag.src = event.target.result;
  };

  reader.readAsDataURL(selectedFile);
};
