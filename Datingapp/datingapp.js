import deleteCrudUser from "../Request/DELETE_user.js";
import getCrudUsers from "../Request/GET_user.js";
import updateUser from "../Request/PUT_info.js";
import postFilter from "../Request/POST_filter.js";
import getFilter from "../Request/GET_filter.js";
import putFilter from "../Request/PUT_filter.js";
import postLikedUser from "../Request/POST_liked.js";
import getLikedUsers from "../Request/GET_liked.js";
import deleteLikedUser from "../Request/DELETE_liked.js";



let currentUser = null;
let filteredCandidates = [];
let filterset = { gender: "", minAge: "", maxAge: "" }; 


const userLoggedIn = JSON.parse(localStorage.getItem("user"));

// 🌟 Tilleggsfunksjonalitet
function getTodayKey() {
    const today = new Date().toISOString().split("T")[0];
    return `likeLimit_${userLoggedIn._id}_${today}`;
}

function getRemainingLikes() {
    const key = getTodayKey();
    const stored = JSON.parse(localStorage.getItem(key));
    return stored ? stored.remaining : 20;
}

function setRemainingLikes(count) {
    const key = getTodayKey();
    localStorage.setItem(key, JSON.stringify({ remaining: count }));
}

if (!userLoggedIn) {
    alert("Please log in to continue using the app.");
    window.location.href = "/Login/login.html";
} else {
    document.addEventListener("DOMContentLoaded", async () => {
        await loadUserFilter();
        document.getElementById("information-user").innerHTML = `
            <p>Welcome to Dating App, where you can connect with others, <strong>${userLoggedIn.name}</strong>!</p>
        `;
        showSection("home");
        
        const remain = getRemainingLikes();
        document.getElementById("btn-like").innerText = `Like (${remain} left)`;
        document.getElementById("btn-like").disabled = remain <= 0;

    });
}

async function loadUserFilter() {
    try {
        const data = await getFilter();
        if (!Array.isArray(data)) {
            console.warn("[GET_filter] Response is not an array:", data);
            return;
        }

        const userFilter = data.find(item => item.userId === userLoggedIn._id);
        if (userFilter) {
            filterset = userFilter;
            userLoggedIn._filterId = userFilter._id;
            localStorage.setItem("user", JSON.stringify(userLoggedIn));
            console.log("[GET_filter] Loaded saved filter:", userFilter);

            document.getElementById("filter-sex").value = filterset.gender || "";
            document.getElementById("filter-min").value = filterset.minAge || "";
            document.getElementById("filter-max").value = filterset.maxAge || "";
        }
    } catch (err) {
        console.error("[GET_filter] Failed to load filter", err);
    }
}

//Nav  
document.getElementById("nav-home").addEventListener("click",()=>showSection("home"));
document.getElementById("nav-profile").addEventListener("click",()=>{
    showSection("profile");
    showUserInformation(userLoggedIn);
});


document.getElementById("nav-swipe").addEventListener("click", async() => {
    showSection("swipe");
    const userKey = userLoggedIn._id || userLoggedIn.email;
    const savedSwipe = localStorage.getItem(`currentSwipe_${userKey}`);
    if (savedSwipe) {
        currentUser = JSON.parse(savedSwipe);
        showUser(currentUser);
        return;
    }
    if (!currentUser && filteredCandidates.length === 0) {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
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
    }else if (currentUser){
        showUser(currentUser);
    }else if (filteredCandidates.length > 0){
        currentUser = filteredCandidates[0];
        showUser(currentUser);
    }else{
        loadRandom();
    }
    
});


document.getElementById("nav-liked").addEventListener("click", async () => {
    showSection("liked");
    await showLikedUsers();
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("user");
    alert("Logged out.");
    window.location.href = "/Login/login.html"; 
});


function showSection(sectionId){
    const section =["home", "profile", "swipe", "liked"];
    section.forEach((id)=> {
        const element =document.getElementById(`section-${id}`);
        if (element) element.style.display = id ===sectionId ? "block" :"none";
    });
}





document.getElementById("find").addEventListener("click", async () => {
    const gender = document.getElementById("filter-sex").value;
    const minAge = document.getElementById("filter-min").value;
    const maxAge = document.getElementById("filter-max").value;

    filterset = { gender, minAge, maxAge };

    // Save to localStorage
    const userKey = userLoggedIn._id;
    localStorage.setItem(`filters_${userKey}`, JSON.stringify(filterset));

    try {
        
        if (userLoggedIn._filterId) {
            await putFilter(userLoggedIn._filterId, { ...filterset, userId: userKey });
            console.log("[PUT_filter] Filter updated.");
        } else {
            // Nếu chưa có, gọi POST rồi lưu lại _filterId
            const posted = await postFilter({ ...filterset, userId: userKey });
            userLoggedIn._filterId = posted._id;
            localStorage.setItem("user", JSON.stringify(userLoggedIn));
            console.log("[POST_filter] Filter created.");
        }
    } catch (err) {
        console.error(" Failed to save filter to CrudCrud:", err);
    }

    currentUser = null;
    loadRandom();
});





async function loadCrudUsers() {
    const crudUsers = await getCrudUsers();

    return crudUsers
        .filter(u => u._id !== userLoggedIn._id)

        .map(u => {
            
            const parsedAge = parseInt(u.age);

            return {
                name: u.name,
                age: parsedAge,
                gender: u.gender || "", 
                email: u.email || "unknown@gmail.com",
                picture: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
                location: {
                    city: u.location || "unknown",
                    country: u.location?.split(",")[1]?.trim() || "custom"  
                },
                
                dob: { age: parsedAge },
                isCustom: true
            };
        })
        .filter(u => !isNaN(u.age)); 
}

function showUser(user) {
    if (!user) {
        document.getElementById("random-card").innerHTML =
            "<p>No more matches. Try changing your filters.</p>";
        return;
    }
    currentUser = user;
    const userKey = userLoggedIn._id || userLoggedIn.email;
    localStorage.setItem(`currentSwipe_${userKey}`, JSON.stringify(user));

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

    const userKey = userLoggedIn._id || userLoggedIn.email;
    const dislikedGeneral = JSON.parse(localStorage.getItem(`dislikedGeneral_${userKey}`)) || [];
    const dislikedFiltered = JSON.parse(localStorage.getItem(`dislikedFiltered_${userKey}`)) || [];
    const likedList = JSON.parse(localStorage.getItem(`likedUsers_${userKey}`)) || [];
    console.log("[LikedList] Keys stored in localStorage:", likedList);



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
    console.log(" Raw candidate ages:");
    candidates.forEach(u => {
        console.log(`${u.name} - typeof age:`, typeof u.dob.age, "| value:", u.dob.age);
    });
    candidates.forEach(u => {
        u.dob.age = parseInt(u.dob.age);
    });



    if (workFilter){
        const min = parseInt(filters.minAge);
        const max = parseInt(filters.maxAge);

        candidates = candidates.filter(user => {
            const age = Number(user.dob.age);
            const matchAge = (isNaN(min) || age >= min) && (isNaN(max) || age <= max);
            const matchGender = !filters.gender || user.gender === filters.gender;

            const key = `${user.name}|${user.dob.age}|${user.email}`;
            if (likedList.includes(key)) {
                console.log(`[FILTER OUT - Liked] Matched key: ${key}`);
            } else {
            console.log(`[CHECK] Current user key not in likedList: ${key}`);
            }

            const notDisliked = !dislikedFiltered.includes(key);
            const notLiked = !likedList.includes(key);
            return matchAge && matchGender && notDisliked && notLiked;
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
            return !dislikedGeneral.includes(key) && !likedList.includes(key);
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

async function saveUserLiked(user) {
    try {
        const userKey = userLoggedIn._id || userLoggedIn.email;
        const allLiked = await getLikedUsers(); // Fetch toàn bộ trước
        const alreadyLiked = allLiked.find(u =>
            u.ownerId === userKey &&
            u.name === (user.name.first || user.name) &&
            u.age === user.dob.age &&
            u.email === user.email
        );

        if (alreadyLiked) {
            console.log("[Like] User already liked, skipping POST");
            return;
        }

        const likedUser = {
            ownerId: userKey,
            name: user.name.first || user.name,
            age: user.dob.age,
            email: user.email,
            picture: user.picture.large || user.picture,
            location: user.location,
            isCustom: user.isCustom || false
        };

        await postLikedUser(likedUser);
        console.log("[Like] User saved to liked list:", likedUser);
    } catch (err) {
        console.error("[Like] Failed to save user:", err);
    }
}


async function showLikedUsers() {
    const container = document.getElementById("section-liked");
    container.innerHTML = "<h3>Your Liked Users</h3>";

    const userKey = userLoggedIn._id || userLoggedIn.email;
    const allLiked = await getLikedUsers();

    const liked = allLiked.filter(u => u.ownerId === userKey);

    if (liked.length === 0) {
        container.innerHTML += "<p>No liked users yet.</p>";
        return;
    }

    liked.forEach(user => {
        const card = document.createElement("div");
        card.classList.add("liked-card");
        card.innerHTML = `
            <img src="${user.picture}" alt="User Image" style="width: 80px; border-radius: 50%;">
            <h4>${user.name}</h4>
            <p>Age: ${user.age}</p>
            <p>Location: ${user.location.city}, ${user.location.country}</p>
            <button class="btn btn-danger btn-sm" data-id="${user._id}">Delete</button>
            <hr/>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll("#section-liked button[data-id]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");

            const deletedUser = liked.find(u => u._id === id);
            if (!deletedUser) {
                console.warn("[Delete] User not found in liked list:", id);
                return;
            }
            const userKey = userLoggedIn._id || userLoggedIn.email;
            const likedListKey = `likedUsers_${userKey}`;
            const likedList = JSON.parse(localStorage.getItem(likedListKey)) || [];

            const deleteKey = `${deletedUser.name}|${deletedUser.age}|${deletedUser.email}`;
            const newLikedList = likedList.filter(k => k !== deleteKey);
            localStorage.setItem(likedListKey, JSON.stringify(newLikedList));
            console.log("[DELETE_LIKED] Removed from localStorage:", deleteKey);

            await deleteLikedUser(id);
            await showLikedUsers(); 
        });
    });
}


document.getElementById("btn-like").addEventListener("click", async () => {
    if (!currentUser) return; // Tránh lỗi nếu currentUser là null

    const remain = getRemainingLikes();
    if (remain <= 0) {
        alert("You have used up all your likes today!");
        return;
    }

    await saveUserLiked(currentUser);

    setRemainingLikes(remain - 1);
    document.getElementById("btn-like").innerText = `Like (${remain - 1} left)`;
    document.getElementById("btn-like").disabled = (remain - 1) <= 0;

    const userKey = userLoggedIn._id || userLoggedIn.email;
    localStorage.removeItem(`currentSwipe_${userKey}`);

    const likeKey = `${currentUser.name}|${currentUser.dob.age}|${currentUser.email}`;
    const likedListKey = `likedUsers_${userKey}`;
    const likedList = JSON.parse(localStorage.getItem(likedListKey)) || [];

    if (!likedList.includes(likeKey)) {
        likedList.push(likeKey);
        localStorage.setItem(likedListKey, JSON.stringify(likedList));
    }

    currentUser = null;

    if (filteredCandidates.length > 0) {
        showUser(filteredCandidates.shift());
    } else {
        loadRandom();
    }
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