<script lang="ts">
    import Swal from 'sweetalert2';

    let { data } = $props();

    let name = $state(data.users.name || '');
    let email = $state(data.users.email || '');
    let subject = $state(data.profile?.subject || '');
    let hourlyRate = $state(data.profile?.hourlyRate || 0);
    let profileImageUrl = $state(data.profile?.profileImageUrl || '');
    let bio = $state(data.profile?.bio || '');

    let newProfileImage: File | null = null;
    // svelte-ignore state_referenced_locally
        let imagePreviewUrl = $state(profileImageUrl);

    const getFormHtml = () => `
        <div class="space-y-6">
            <div id="drop-zone" class="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
                <img id="image-preview" src="${imagePreviewUrl || '/Logo.svg'}" alt="Profile Preview" class="w-32 h-32 rounded-full object-cover mb-4">
                <p class="text-gray-500">Drag & drop your new profile picture here, or click to select a file.</p>
                <input type="file" id="file-input" class="hidden" accept="image/*">
            </div>
            <div class="relative">
                <label for="name" class="block mb-1 text-left text-gray-600">Name:</label>
                <input id="name" type="text" class="w-full p-2 border border-gray-300 rounded-md" value="${name || ''}">
            </div>
            <div class="relative">
                <label for="email" class="block mb-1 text-left text-gray-600">Email:</label>
                <input id="email" type="email" class="w-full p-2 border border-gray-300 rounded-md" value="${email || ''}">
            </div>
            <div class="relative">
                <label for="subject" class="block mb-1 text-left text-gray-600">Subject:</label>
                <input id="subject" type="text" class="w-full p-2 border border-gray-300 rounded-md" value="${subject || ''}">
            </div>
            <div class="relative">
                <label for="hourlyRate" class="block mb-1 text-left text-gray-600">Hourly Rate:</label>
                <input id="hourlyRate" type="number" class="w-full p-2 border border-gray-300 rounded-md" value="${hourlyRate || 0}">
            </div>
            <div class="relative">
                <label for="bio" class="block mb-1 text-left text-gray-600">Bio:</label>
                <textarea id="bio" class="w-full p-2 border border-gray-300 rounded-md">${bio || ''}</textarea>
            </div>
        </div>
    `;

    const handleFileChange = (file: File) => {
        newProfileImage = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                imagePreviewUrl = e.target.result as string;
                const imagePreview = document.getElementById('image-preview') as HTMLImageElement;
                if (imagePreview) {
                    imagePreview.src = imagePreviewUrl;
                }
            }
        };
        reader.readAsDataURL(file);
    };

    const editModal = () => {
        Swal.fire({
            title: 'Edit Profile',
            html: getFormHtml(),
            width: '40rem',
            didOpen: () => {
                const dropZone = document.getElementById('drop-zone');
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                 if (dropZone && fileInput) {
                    dropZone.addEventListener('click', () => fileInput.click());
                    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-blue-500', 'bg-blue-50'); });
                    dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('border-blue-500', 'bg-blue-50'); });
                    dropZone.addEventListener('drop', (e) => {
                        e.preventDefault();
                        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
                        const files = e.dataTransfer?.files;
                        if (files && files.length > 0) {
                            fileInput.files = files;
                            handleFileChange(files[0]);
                        }
                    });
                    fileInput.addEventListener('change', () => {
                        if (fileInput.files && fileInput.files.length > 0) {
                            handleFileChange(fileInput.files[0]);
                        }
                    });
                }
            },
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const nameInput = (document.getElementById('name') as HTMLInputElement).value;
                const emailInput = (document.getElementById('email') as HTMLInputElement).value;
                const subjectInput = (document.getElementById('subject') as HTMLInputElement).value;
                const hourlyRateInput = parseFloat((document.getElementById('hourlyRate') as HTMLInputElement).value);
                const bioInput = (document.getElementById('bio') as HTMLTextAreaElement).value;

                if (!nameInput) {
                    Swal.showValidationMessage('Please enter your name.');
                    return false;
                }
                if (!emailInput) {
                    Swal.showValidationMessage('Please enter your email.');
                    return false;
                }
                if (!subjectInput) {
                    Swal.showValidationMessage('Please enter a subject.');
                    return false;
                }
                if (isNaN(hourlyRateInput)) {
                    Swal.showValidationMessage('Please enter a valid hourly rate.');
                    return false;
                }

                return {
                    name: nameInput,
                    email: emailInput,
                    subject: subjectInput,
                    hourlyRate: hourlyRateInput,
                    bio: bioInput
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed && result.value) {
                const formData = new FormData();

                formData.append('name', result.value.name);
                formData.append('email', result.value.email);
                formData.append('subject', result.value.subject);
                formData.append('hourlyRate', result.value.hourlyRate.toString());
                formData.append('bio', result.value.bio);

                if (newProfileImage) {
                    formData.append('profileImage', newProfileImage);
                }
                
                try {
                    const response = await fetch('/profile?/edit', {
                        method: 'POST',
                        body: formData
                    });

                    const responseData = await response.json();

                    if (response.ok) {
                        Swal.fire('Success', responseData.message, 'success');

                        const updatedData = responseData.data;
                        name = updatedData.name;
                        email = updatedData.email;
                        subject = updatedData.subject;
                        hourlyRate = updatedData.hourlyRate;
                        bio = updatedData.bio;
                        profileImageUrl = updatedData.profileImageUrl; 
                        imagePreviewUrl = updatedData.profileImageUrl;
                        newProfileImage = null;
                    } else {
                        Swal.fire('Error', responseData.message || 'Failed to update profile.', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Failed to connect to the server.', 'error');
                }
            }
        });
    };
</script>

<!-- profile -->
<div class="mx-auto max-w-4xl p-6">
    <h1 class="text-5xl font-bold text-center mb-8">Profile</h1>
    <!-- Tutor Profile Section -->
    <div class="flex flex-col md:flex-row gap-8 mb-10">
        <div class="space-y-2 flex-grow">
            <h1 class="text-4xl font-semibold mb-4">{name}</h1>
            <p><strong>Bio:</strong> {bio || 'No bio available'}</p>
            <p><strong>Subject:</strong> {subject}</p>
            <p><strong>Hourly Rate:</strong> ${hourlyRate}</p>
            <p><strong>Contact:</strong> {email}</p>
            <button class="mt-4 rounded-3xl border-1 border-[#081F5C5A] bg-[#0000005A] px-10 py-2 font-bold inset-shadow-[0px_0px_10px_2px_#e3e3e3be] transition-colors hover:bg-[#000000a5]" onclick={editModal}>EDIT PROFILE</button>
        </div>
        <div class="flex-shrink-0 flex items-center justify-center">
            <img
                src={profileImageUrl || '/Logo.svg'}
                alt={`Profile of ${name}`}
                class="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover shadow-lg"
            />
        </div>
    </div>
</div>