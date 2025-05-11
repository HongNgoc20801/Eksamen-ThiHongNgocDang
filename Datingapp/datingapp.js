import deleteCrudUser from "../Request/DELETE_user.js";
import getCrudUsers from "../Request/GET_user.js";
import updateUser from "../Request/PUT_info.js";

let currentUser = null;
let filteredCandidates = [];


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


document.getElementById("nav-swipe").addEventListener("click", async() => {
    showSection("swipe");
    const user = JSON.parse(localStorage.getItem("user"));
        

    try {
        const updatedUser = {
            name: user.name,
            password: user.password,
            email: user.email || "",
            age: user.age || "",
            gender: user.gender || "",
            location: user.location || "",
            bio: user.bio || "",
                
        };

        await updateUser(user._id, updatedUser);
        const updatedWithId = { ...updatedUser, _id: user._id };
        localStorage.setItem("user", JSON.stringify(updatedWithId)); 
        Object.assign(userLoggedIn, updatedWithId);

        setTimeout(() => {
            loadRandom();
        }, 200);
    } catch (err) {
        console.error(" Failed to update user info", err);
        document.getElementById("random-card").innerHTML = "<p>Could not update profile.</p>";
    }
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
};




document.getElementById("find").addEventListener("click",()=>{
    filterset.gender=document.getElementById("filter-sex").value;
    filterset.minAge=document.getElementById("filter-min").value;
    filterset.maxAge=document.getElementById("filter-max").value;

    currentUser=null;
    loadRandom();
});




async function loadCrudUsers() {
    const crudUsers = await getCrudUsers();

    return crudUsers
        .filter(u => u._id !== userLoggedIn._id)

        .map(u => {
            
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
                
                dob: { age},
                isCustom: true
            };
        })
        .filter(u => u.age && u.gender); 
}

function showUser(user) {
    if (!user) {
        document.getElementById("random-card").innerHTML =
            "<p>No more matches. Try changing your filters.</p>";
        return;
    }
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
async function loadRandom() {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const filters = filterset;
    const workFilter = 
        (filters.gender && filters.gender !== "") ||
        (filters.minAge && filters.minAge.trim() !== "") ||
        (filters.maxAge && filters.maxAge.trim() !== "");
    const fetchNumber = 10 ;

    const urlParams = [`results=${fetchNumber}`];
    if (filters.gender && filters.gender !== "") urlParams.push(`gender=${filters.gender}`);
    const url = `https://randomuser.me/api/?${urlParams.join("&")}`;

    const [res, crudUsers] = await Promise.all([
        fetch(url),
        loadCrudUsers()
    ]);
    const data = await res.json();

    const userKey = userLoggedIn.email || userLoggedIn._id;
    const dislikedGeneral = JSON.parse(localStorage.getItem(`dislikedGeneral_${userKey}`)) || [];
    const dislikedFiltered = JSON.parse(localStorage.getItem(`dislikedFiltered_${userKey}`)) || [];

    const randomUsers = data.results.map(u => ({
        name: `${u.name.first} ${u.name.last}`,
        age: u.dob.age,
        gender: u.gender,
        email: u.email,
        picture: u.picture.large,
        location: {
            city: u.location.city,
            country: u.location.country
        },
        dob: u.dob,
        isCustom: false
    }));

    let candidates = [...randomUsers, ...crudUsers];
    console.log("📌 Raw candidate ages:");
    candidates.forEach(u => {
        console.log(`${u.name} - typeof age:`, typeof u.dob.age, "| value:", u.dob.age);
    });
    candidates.forEach(u => {
        u.dob.age = parseInt(u.dob.age);
    });



    if (workFilter){
        const min = filters.minAge ? parseInt(filters.minAge) : null;
        const max = filters.maxAge ? parseInt(filters.maxAge) : null;

        candidates = candidates.filter(user => {
            const age = Number(user.dob.age);
            const matchAge = (!min || age >= min) && (!max || age <= max);
            const matchGender = !filters.gender || user.gender === filters.gender;

            const key = `${user.name}|${user.dob.age}|${user.email}`;
            const notDisliked = !dislikedFiltered.includes(key);
            return matchAge && matchGender && notDisliked;
        });

        console.log("Users after filtering:", candidates.map(u => ({
            name: u.name,
            age: u.dob.age,
            gender: u.gender,
            email: u.email,
            location: `${u.location.city}, ${u.location.country}`,
            from: u.isCustom ? "custom" : "random"
        })));
        filteredCandidates = candidates;
        showUser(filteredCandidates.shift());
    } else {
        const available = candidates.filter(user => {
            const key = `${user.name}|${user.dob.age}|${user.email}`;
            return !dislikedGeneral.includes(key);
        });

        if (available.length === 0) {
            document.getElementById("random-card").innerHTML = "<p>No more matches. Try changing your filters.</p>";
            return;
        }

        filteredCandidates = [...available]; 
        const picked = filteredCandidates.shift();

        console.log(" No filter applied. Showing single random user:", picked);
        showUser(picked);
    }
    

}


document.getElementById("btn-like").addEventListener("click", () =>{
    saveUserLiked(currentUser);
    currentUser =null;
    loadRandom();
});

document.getElementById("btn-dislike").addEventListener("click", () => {
    if (currentUser) {
        const key = `${currentUser.name}|${currentUser.dob.age}|${currentUser.email}`;
        const usingFilter =
            (filterset.gender && filterset.gender !== "") ||
            (filterset.minAge && filterset.minAge.trim() !== "") ||
            (filterset.maxAge && filterset.maxAge.trim() !== "");

        const userKey = userLoggedIn.email || userLoggedIn._id;
        const listKey = usingFilter ? `dislikedFiltered_${userKey}` : `dislikedGeneral_${userKey}`;
        const list = JSON.parse(localStorage.getItem(listKey)) || [];

        if (!list.includes(key)) {
            list.push(key);
            localStorage.setItem(listKey, JSON.stringify(list));
        }
    }

    currentUser = null;

    if (filteredCandidates.length > 0) {
        showUser(filteredCandidates.shift());
    } else {
        loadRandom(); 
    }
});




//showUserinformation
function showUserInformation(user){
    const informationDiv = document.getElementById("section-profile");
    informationDiv.innerHTML=`
        <h3> Your Profile </h3>
        <p><strong>Username:</strong> ${user.name}</p>
        <p><strong>Password:</strong> ${"*".repeat(user.password.length)}</p>
        <p><strong>Email:</strong> ${user.email || "Not set"}</p> 
        <p><strong>Age:</strong> ${user.age || "Not set"}</p>
        <p><strong>Gender:</strong> ${user.gender || "Not set"}</p>
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
        <input type="email" id="edit-email" value="${user.email || ''}" placeholder="Email" required/> 
        <input type="password" id="edit-password" value="${user.password}" required/>
        <input type="number" id="edit-age" value="${user.age || ''}" placeholder="Age" />
        <select id="edit-gender">
            <option value="">Select gender</option>
            <option value="male" ${user.gender === "male" ? "selected" : ""}>Male</option>
            <option value="female" ${user.gender === "female" ? "selected" : ""}>Female</option>
        </select>
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
      email: document.getElementById("edit-email").value,
      password: document.getElementById("edit-password").value,
      age:document.getElementById("edit-age").value,
      gender: document.getElementById("edit-gender").value,
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

            Object.assign(userLoggedIn, updatedWithId);
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


