const API_URL = 'http://localhost:5001/api/members';

// DOM Elements
const memberForm = document.getElementById('member-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const membersContainer = document.getElementById('members-container');

// Form inputs
const memberIdInput = document.getElementById('member-id');
const nameInput = document.getElementById('name');
const genderInput = document.getElementById('gender');
const departmentInput = document.getElementById('department');
const roleInput = document.getElementById('role');

// Load all members when page loads
document.addEventListener('DOMContentLoaded', loadMembers);

// Form submit handler
memberForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const memberId = memberIdInput.value;
    const memberData = {
        name: nameInput.value,
        gender: genderInput.value,
        department: departmentInput.value,
        role: roleInput.value
    };

    if (memberId) {
        await updateMember(memberId, memberData);
    } else {
        await createMember(memberData);
    }
});

// Cancel edit button
cancelBtn.addEventListener('click', resetForm);

// Load all members
async function loadMembers() {
    try {
        const response = await fetch(API_URL);
        const members = await response.json();

        if (members.length === 0) {
            membersContainer.innerHTML = '<p class="no-data">No team members yet. Add your first member!</p>';
            return;
        }

        displayMembers(members);
    } catch (error) {
        console.error('Error loading members:', error);
        membersContainer.innerHTML = '<p class="error">Error loading team members. Please ensure the backend server is running.</p>';
    }
}

// Display members in the UI
function displayMembers(members) {
    membersContainer.innerHTML = '';

    members.forEach(member => {
        const memberCard = document.createElement('div');
        memberCard.className = 'member-card';
        memberCard.innerHTML = `
            <div class="member-info">
                <h3>${member.name}</h3>
                <p><strong>Gender:</strong> ${member.gender}</p>
                <p><strong>Department:</strong> ${member.department}</p>
                <p><strong>Role:</strong> ${member.role}</p>
            </div>
            <div class="member-actions">
                <button class="btn-edit" onclick="editMember(${member.id})">Edit</button>
                <button class="btn-delete" onclick="deleteMember(${member.id})">Delete</button>
            </div>
        `;
        membersContainer.appendChild(memberCard);
    });
}

// Create new member
async function createMember(memberData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
        });

        if (response.ok) {
            resetForm();
            loadMembers();
            showMessage('Team member added successfully!', 'success');
        } else {
            showMessage('Error adding team member', 'error');
        }
    } catch (error) {
        console.error('Error creating member:', error);
        showMessage('Error connecting to server', 'error');
    }
}

// Edit member
async function editMember(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const member = await response.json();

        memberIdInput.value = member.id;
        nameInput.value = member.name;
        genderInput.value = member.gender;
        departmentInput.value = member.department;
        roleInput.value = member.role;

        formTitle.textContent = 'Edit Team Member';
        submitBtn.textContent = 'Update Member';
        cancelBtn.style.display = 'inline-block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading member:', error);
        showMessage('Error loading member details', 'error');
    }
}

// Update member
async function updateMember(id, memberData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
        });

        if (response.ok) {
            resetForm();
            loadMembers();
            showMessage('Team member updated successfully!', 'success');
        } else {
            showMessage('Error updating team member', 'error');
        }
    } catch (error) {
        console.error('Error updating member:', error);
        showMessage('Error connecting to server', 'error');
    }
}

// Delete member
async function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this team member?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadMembers();
            showMessage('Team member deleted successfully!', 'success');
        } else {
            showMessage('Error deleting team member', 'error');
        }
    } catch (error) {
        console.error('Error deleting member:', error);
        showMessage('Error connecting to server', 'error');
    }
}

// Reset form
function resetForm() {
    memberForm.reset();
    memberIdInput.value = '';
    formTitle.textContent = 'Add New Team Member';
    submitBtn.textContent = 'Add Member';
    cancelBtn.style.display = 'none';
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
