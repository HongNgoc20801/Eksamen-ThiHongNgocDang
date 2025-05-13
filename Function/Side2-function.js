function filteredCandidates(users,filter,dislikedList =[], likedList =[]){
    return users.filter(user => {
        const age = parseInt(user.dob.age);
        const key = `${user.name} | ${age} | ${user.email}`;

        const matchAge = (!filter.minAge || age >= filter.minAge) && (!filter.maxAge || age <= filter.maxAge);

        const matchGender = !filter.gender || user.gender === filter.gender;
        const notDisliked = !dislikedList.includes(key);
        const notLiked = !likedList.includes(key);

        return matchAge && matchGender && notDisliked && notLiked;
    })
}
function getDayKey(userId){
    const day = new Date ().toISOString().split("I") [0];
    return `likeLimit_${userId}_${day}`;
}
module.exports = { filteredCandidates, getDayKey };
