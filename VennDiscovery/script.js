document.addEventListener('DOMContentLoaded', () => {
    function addCheckmarkToAvatar(avatar) {
        if (!avatar.querySelector('.checkmark-selected-indicator')) {
            const checkmarkIndicator = document.createElement('div');
            checkmarkIndicator.classList.add('checkmark-selected-indicator');
            const checkmarkImg = document.createElement('img');
            checkmarkImg.src = '../assets/icons/check.svg';
            checkmarkImg.alt = 'Selected Profile';
            checkmarkIndicator.appendChild(checkmarkImg);
            avatar.appendChild(checkmarkIndicator);
        }
    }

    const profileAutos = document.querySelectorAll('.profile-auto');
    profileAutos.forEach(profileDiv => {
        profileDiv.addEventListener('click', function(event) {
            if (this.classList.contains('add')) return;
            document.querySelectorAll('.avatar-auto.selected').forEach(selectedAv => {
                selectedAv.classList.remove('selected');
                const checkmark = selectedAv.querySelector('.checkmark-selected-indicator');
                if (checkmark) checkmark.remove();
            });
            const avatar = this.querySelector('.avatar-auto');
            if (avatar) {
                avatar.classList.add('selected');
                addCheckmarkToAvatar(avatar);
            }
        });
    });

    const firstProfileDiv = document.querySelector('.profile-auto:not(.add)');
    if (firstProfileDiv) {
        const firstAvatar = firstProfileDiv.querySelector('.avatar-auto');
        if (firstAvatar) {
            if (!firstAvatar.classList.contains('selected')) firstAvatar.classList.add('selected');
            addCheckmarkToAvatar(firstAvatar);
        }
    }
});