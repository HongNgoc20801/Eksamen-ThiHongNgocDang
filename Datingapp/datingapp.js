import { apiUserUrl } from "../Authentication/AUTH.js";
import deleteCrudUser from "../Request/DELETE_user.js";
import getCrudUsers from "../Request/GET_user.js";
import updateUser from "../Request/PUT_info.js";


const userLoggedIn=JSON.parse(localStorage.getItem("user"));
if(!userLoggedIn){
    alert("Please log in to continue using the app.");
    window.location.href="/Login/login.html";
}else{
    document.getElementById("information-user").innerHTML = `
    <p>Welcome to Dating App, where you can connnect with the other even how far it is, <strong>${userLoggedIn.name}</strong>!</p>
    `;
    showSection("home")
} 
//Nav  
document.getElementById("nav-home").addEventListener("click",()=>showSection("home"));
document.getElementById("nav-profile").addEventListener("click",()=>{
    showSection("profile");
    showUserInformation(userLoggedIn);
});


document.getElementById("nav-swipe").addEventListener("click",()=> {
    showSection("swipe");
    setTimeout(()=>{
        if (!currentUser) loadRandom();
    },100);
});


document.getElementById("nav-liked").addEventListener("click",()=> showSection("liked"));

function showSection(sectionId){
    const section =["home", "profile", "swipe", "liked"];
    section.forEach((id)=> {
        const element =document.getElementById(`section-${id}`);
        if (element) element.style.display = id ===sectionId ? "block" :"none";
    });
}

let filterset=JSON.parse(localStorage.getItem("filters")) || {
    gender:"",
    minAge:"",
    maxAge:"",
    country:"",
};

document.getElementById("find").addEventListener("click",()=>{
    filterset.gender=document.getElementById("filter-sex").value;
    filterset.minAge=document.getElementById("filter-min").value;
    filterset.maxAge=document.getElementById("filter-max").value;
    filterset.country=document.getElementById("filter-country").value;

    localStorage.setItem("filters", JSON.stringify(filterset));
    currentUser=null;
    loadRandom();
});

let currentUser = null;

async function loadCrudUsers() {
    const crud =await getCrudUsers();
    return crud
        .filter(u => u._id !== userLoggedI._id)
        .map(u =>({
            name: u.name,
            age:parseInt(u.age),
            email:u.email || "unknown@gmail.com",
            picture: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
            location:{
                city: u.location || "unknown",
                country:"custom"
            },
            dob:{age:parseInt(u.age)},
            isCustom:true
        }));
}

async function loadRandom() {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const filters = JSON.parse(localStorage.getItem("filters")) || {};
    const workFilter = filters.gender || filters.minAge || filters.maxAge || filters.country;
    const fetchNumber = workFilter ? 10 : 1;

    let baseUrl = "https://randomuser.me/api";
    const params = [];
    if (filters.gender) params.push(`gender=${filters.gender}`);
    params.push(`results=${fetchNumber}`);
    const url = `${baseUrl}?${params.join("&")}`;

    const [res, crudUsers] = await Promise.all([
        fetch(url),
        loadCrudUsers()
    ]);
    const data = await res.json();
    let candidates = [...data.results, ...crudUsers];

    if (workFilter) {
        const min = parseInt(filters.minAge) || 0;
        const max = parseInt(filters.maxAge) || 120;
        const targetCountry = (filters.country || "").toLowerCase();

        candidates = candidates.filter(user => {
            const age = user.dob.age;
            const country = (user.location.country || "").toLowerCase();
            const matchAge = age >= min && age <= max;
            const matchCountry = !targetCountry || country.includes(targetCountry);
            return matchAge && matchCountry;
        });

        if (candidates.length === 0) {
            document.getElementById("random-card").innerHTML =
                "<p>No one matches your standards. Try again.</p>";
            return;
        }
    }

    const user = candidates[0];
    currentUser = user;

    document.getElementById("random-card").innerHTML = `
        <img src="${user.picture.large || user.picture}" alt="User-Photo" style="border-radius: 50%; width: 100px;">
        <h4>${user.name.first || user.name}</h4>
        <p>Email: ${user.email}</p>
        <p>Age: ${user.dob.age}</p>
        <p>Location: ${user.location.city}, ${user.location.country}</p>
        ${user.isCustom ? "<span class='badge'>Custom User</span>" : ""}
    `;
}

document.getElementById("btn-like").addEventListener("click", () =>{
    saveUserLiked(currentUser);
    currentUser =null;
    loadRandom();
});

document.getElementById("btn-dislike").addEventListener("click", ()=>{
    currentUser=null;
    loadRandom();
});

//showUserinformation
function showUserInformation(user){
    const informationDiv = document.getElementById("section-profile");
    informationDiv.innerHTML=`
        <h3> Your Profile </h3>
        <p><strong>Username:</strong> ${user.name}</p>
        <p><strong>Password:</strong> ${"*".repeat(user.password.length)}</p>
        <p><strong>Age:</strong> ${user.age || "Not set"}</p>
        <p><strong>Location:</strong> ${user.location || "Not set"}</p>
        <p><strong>Bio:</strong> ${user.bio || "Not Bio set"}</p>
        <br>
        <button id="edit-profile-btn" style="margin-top:1.2rem; background-color:#46a2da; color:white; border-radius:5px;">Edit Profile</button>
        <button id="delete-user-btn" style="margin-top:1.2rem; background-color:red; color:white; border-radius:5px;">Delete My Account</button>
    
    `;

    document.getElementById("edit-profile-btn").addEventListener("click",()=>{
        showEditForm(user);
    });
    document.getElementById("delete-user-btn").addEventListener("click",async()=>{
        const confirmDelete = confirm("Do you really want to do it? ");
        if(!confirmDelete)return;
        try{
            await deleteCrudUser(user._id);
            localStorage.removeItem("user");
            alert("Successfully!");
            window.location.href="/Login/login.html";
        }catch(err){
            alert("Unsuccess to delete account!");
            console.error(err);
        }
    });
}

function showEditForm(user) {
  const informationDiv = document.getElementById("section-profile");
  informationDiv.innerHTML = `
    <h3>Edit Profile</h3>
    <form id="edit-profile-form">
        <input type="text" id="edit-username" value="${user.name}" required/>
        <input type="password" id="edit-password" value="${user.password}" required/>
        <input type="number" id="edit-age" value="${user.age || ''}" placeholder="Age" />
        <input type="text" id="edit-location" value="${user.location || ''}" placeholder="Location"/>
        <textarea id="edit-bio" placeholder=" write something to let people know more about you">${user.bio || ''}</textarea>

        <br/>
        <button type="submit">Save Changes</button>
    </form>
  `;

  document.getElementById("edit-profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const updatedUser = {
      name: document.getElementById("edit-username").value,
      password: document.getElementById("edit-password").value,
      age:document.getElementById("edit-age").value,
      location:document.getElementById("edit-location").value,
      bio:document.getElementById("edit-bio").value,

    };

    console.log(" Local user object:", user);
    console.log(" ID to PUT:", user._id);

    if (!user._id) {
      alert("User ID is missing. Cannot update.");
      return;
    }

    try {
            await updateUser(user._id, updatedUser);
            const updatedWithId = { ...updatedUser, _id: user._id };
            localStorage.setItem("user", JSON.stringify(updatedWithId));
            document.getElementById("information-user").innerHTML = `
                <p>Welcome, <strong>${updatedWithId.name}</strong></p>
            `;
            alert("Profile updated!");
            showUserInformation(updatedWithId);
        } catch (err) {
            alert("Failed to update profile.");
            console.log(err);
        }
    });
}


