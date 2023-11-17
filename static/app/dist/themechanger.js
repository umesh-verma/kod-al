const colorscheme ={
  jungle:{
      transparentlightshade : "rgb(255 255 255 / 74%)",
      transparentdarkbackground : "#377f07ea",
      bordercolor : "#76b84a",
      maindarkbackground : "#1e8308",
      maintransparentdarkshade : "rgb(68 156 35 / 30%)",
      lightdarkbackgroundtwoshade : "#1f721f",
      lightdarkbackgroundoneshade : "#138004",
      lightdarkbackgroundthreeshade : "#d6e1d2;",
      mainlightcolor : "#fff",
      darklightcoloroneshade : "rgb(122 200 114)",
      darklightcolortwoshade : "#a0dca3",
      darkboxshadow : "rgba(255, 255, 255, .20)",
      darkboxshadowlight : "rgba(255,255,255,.02)",
      backgroundimage:"url('../../images/file_icon/icon_others/jungle/sidebar.png')",
      recycleicon : "url('../../images/file_icon/icon_others/jungle/recycle.png')",
      recyclefullicon : "url('../../images/file_icon/icon_others/jungle/recycle_full.png')"
  },
  sea :{
      transparentlightshade : "rgb(255 255 255 / 74%)",
      transparentdarkbackground : "#2ac0b2ea",
      bordercolor : "#28978e",
      maindarkbackground : "#088a7e",
      maintransparentdarkshade : "rgb(35 156 145 / 30%)",
      lightdarkbackgroundtwoshade : "#1d6e64",
      lightdarkbackgroundoneshade : "#036f7e",
      lightdarkbackgroundthreeshade : "#d6e1d2;",
      mainlightcolor : "#fff",
      darklightcoloroneshade : "rgb(110 195 185)",
      darklightcolortwoshade : "#9dd7d4",
      darkboxshadow : "rgba(255, 255, 255, .20)",
      darkboxshadowlight : "rgba(255,255,255,.02)",
      backgroundimage:"url('../../images/file_icon/icon_others/sea/sidebar.png')",
      recycleicon : "url('../../images/file_icon/icon_others/sea/recycle.png')",
      recyclefullicon : "url('../../images/file_icon/icon_others/sea/recycle_full.png')"
  }
}
const rootelement = document.querySelector(":root");
const htmlelement = document.querySelector("html");

const modal = document.querySelector('#theme-modal');
const closeBtn = document.querySelector('.theme-close');

// Events
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', outsideClick);

// Open
function openModal() {
  modal.style.display = 'block';
}

// Close
function closeModal() {
  modal.style.display = 'none';
}

// Close If Outside Click
function outsideClick(e) {
  if (e.target == modal) {
    modal.style.display = 'none';
  }
}

const themelist = document.getElementsByClassName("theme-list");

function setcurrenttheme(){
  htmlelement.classList.remove("light");
  htmlelement.classList.remove("dark-mode");
  htmlelement.classList.add("theme-mode");
  htmlelement.setAttribute('data-theme', "theme-mode");
}
for (i = 0; i < themelist.length; i++) {
  themelist[i].addEventListener("click",function selectTheme(){
    setcurrenttheme();
    let themedata = this.getAttribute('data-theme');
    let data = {theme:themedata};
    sendTheme(themedata);
    if(themedata!="default"){
      setrootvariable(themedata)
      localStorage.setItem("themeset", themedata);
      location.reload();
    }else{
      localStorage.removeItem("themeset");
      location.reload();
    }
    closeModal();
  });

  function sendTheme(params) {

    fetch("data/system/desktop_app.php",{
      "method":"POST",
      "headers":{
        "Content-Type":"application/json; charset=utf-8"
      },
      "body":JSON.stringify(params)
    });
    
}

function setrootvariable(param){
  rootelement.style.setProperty("--transparent-light-shade",colorscheme[param].transparentlightshade);
  rootelement.style.setProperty("--transparent-dark-background",colorscheme[param].transparentdarkbackground); 
  rootelement.style.setProperty("--border-color",colorscheme[param].bordercolor);
  rootelement.style.setProperty("--main-dark-background",colorscheme[param].maindarkbackground); 
  rootelement.style.setProperty("--main-transparent-dark-shade",colorscheme[param].maintransparentdarkshade); 
  rootelement.style.setProperty("--light-dark-background-two-shade",colorscheme[param].lightdarkbackgroundtwoshade); 
  rootelement.style.setProperty("--light-dark-background-one-shade",colorscheme[param].lightdarkbackgroundoneshade); 
  rootelement.style.setProperty("--light-dark-background-three-shade",colorscheme[param].lightdarkbackgroundthreeshade); 
  rootelement.style.setProperty("--main-light-color",colorscheme[param].mainlightcolor) ;
  rootelement.style.setProperty("--dark-light-color-one-shade",colorscheme[param].darklightcoloroneshade); 
  rootelement.style.setProperty("--dark-light-color-two-shade",colorscheme[param].darklightcolortwoshade) ;
  rootelement.style.setProperty("--dark-box-shadow",colorscheme[param].darkboxshadow);
  rootelement.style.setProperty("--dark-box-shadow-light",colorscheme[param].darkboxshadowlight);
  rootelement.style.setProperty("--background-image",colorscheme[param].backgroundimage);
  rootelement.style.setProperty("--recycle-icon",colorscheme[param].recycleicon) ;
  rootelement.style.setProperty("--recycle-full-icon",colorscheme[param].recyclefullicon); 
  rootelement.style.setProperty("--modal-background-color",colorscheme[param].transparentdarkbackground); 

}
};

