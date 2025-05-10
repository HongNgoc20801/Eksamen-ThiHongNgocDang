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


document.getElementById("nav-swipe").addEventListener("click", () => {
    showSection("swipe");
    navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = parseFloat(position.coords.latitude.toFixed(6));
        const longitude = parseFloat(position.coords.longitude.toFixed(6));

        try {
            const updatedUser = {
                name: userLoggedIn.name,
                password: userLoggedIn.password,
                email: userLoggedIn.email || "",
                age: userLoggedIn.age || "",
                location: userLoggedIn.location || "",
                bio: userLoggedIn.bio || "",
                latitude,
                longitude
            };

            await updateUser(userLoggedIn._id, updatedUser);
            const updatedWithId = { ...updatedUser, _id: userLoggedIn._id };
            localStorage.setItem("user", JSON.stringify(updatedWithId)); 
            console.log(" Location updated:", latitude, longitude);
            setTimeout(() => {
                loadRandom();
            }, 200);
        } catch (err) {
            console.error(" Failed to update location", err);
            document.getElementById("random-card").innerHTML = "<p>Could not update location.</p>";
        }
    }, (error) => {
        console.warn(" Location access denied or failed", error);
        loadRandom(); 
    });
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
    distance:""
};
const distanceSlider = document.getElementById("filter-distance");
const distanceLabel = document.getElementById("distance-value");

if (filterset.distance) {
    distanceSlider.value = filterset.distance;
    distanceLabel.textContent = filterset.distance;
} else {
    filterset.distance = distanceSlider.value;
    distanceLabel.textContent = distanceSlider.value;
}

document.getElementById("find").addEventListener("click",()=>{
    filterset.gender=document.getElementById("filter-sex").value;
    filterset.minAge=document.getElementById("filter-min").value;
    filterset.maxAge=document.getElementById("filter-max").value;
    filterset.country=document.getElementById("filter-country").value;
    filterset.distance = document.getElementById("filter-distance").value; 

    currentUser=null;
    loadRandom();
});

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

let currentUser = null;

async function loadCrudUsers() {
    const crudUsers = await getCrudUsers();

    return crudUsers
        .filter(u => u._id !== userLoggedIn._id)
        .map(u => {
            const lat = parseFloat(u.latitude);
            const lon = parseFloat(u.longitude);
            const age = parseInt(u.age);

            return {
                name: u.name,
                age: age,
                gender: u.gender || "", 
                email: u.email || "unknown@gmail.com",
                picture: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
                location: {
                    city: u.location || "unknown",
                    country: u.location?.split(",")[1]?.trim() || "custom"  
                },
                lat: isNaN(lat) ? null : lat,
                lon: isNaN(lon) ? null : lon,
                dob: { age: age },
                isCustom: true
            };
        })
        .filter(u => u.age && u.lat !== null && u.lon !== null); 
}


async function loadRandom() {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const filters = filterset;
    const workFilter = filters.gender || filters.minAge || filters.maxAge || filters.country || filters.distance;
    const fetchNumber = workFilter ? 10 : 1;

    const urlParams = [`results=${fetchNumber}`];
    if (filters.gender) urlParams.push(`gender=${filters.gender}`);
    const url = `https://randomuser.me/api/?${urlParams.join("&")}`;

    const [res, crudUsers] = await Promise.all([
        fetch(url),
        loadCrudUsers()
    ]);
    const data = await res.json();

    const randomUsers = data.results.map(u => ({
        name: `${u.name.first} ${u.name.last}`,
        age: u.dob.age,
        gender: u.gender,
        email: u.email,
        picture: u.picture.large,
        lat: parseFloat(u.location.coordinates.latitude),
        lon: parseFloat(u.location.coordinates.longitude),
        location: {
            city: u.location.city,
            country: u.location.country
        },
        dob: u.dob,
        isCustom: false
    }));

    let candidates = [...randomUsers, ...crudUsers];

    if (workFilter) {
        const min = parseInt(filters.minAge) || 0;
        const max = parseInt(filters.maxAge) || 120;
        const distlimit = (filters.distance );

        candidates = candidates.filter(user => {
            const age = user.dob.age;
            const matchAge = age >= min && age <= max;

            const matchGender = !filters.gender || user.gender===filters.gender;
            const matchCountry=!filters.country || (user.location.country || "").toLowerCase().includes(filters.country.toLowerCase());

            let matchDistance = true;
            if (!isNaN(distlimit) && user.lat && user.lon && userLoggedIn.latitude && userLoggedIn.longitude) {
                const d = haversineDistance(user.lat, user.lon, userLoggedIn.latitude, userLoggedIn.longitude);
                matchDistance = d <= distlimit;
                if (matchDistance) {
                    console.log(` ${user.name}: ${d.toFixed(2)}km`);
                } else {
                    console.log(` ${user.name}: ${d.toFixed(2)}km - too far`);
                }
            }
            return matchAge && matchGender && matchCountry && matchDistance;
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

document.getElementById("filter-distance").addEventListener("input", (e) => {
    document.getElementById("distance-value").textContent = e.target.value;
});

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


