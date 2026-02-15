document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.category-link');
    const sections = document.querySelectorAll('.product-category');

    const activateCategory = (target) => {
        if (!target) return;
        links.forEach(l => l.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));

        const link = document.querySelector(`.category-link[data-category="${target}"]`);
        if (link) link.classList.add('active');

        const selected = document.getElementById(target);
        if (selected) {
            selected.classList.add('active');
            selected.scrollIntoView({ behavior: 'smooth' });
        }
    };

    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = link.getAttribute('data-category');

            activateCategory(target);
        });
    });

    const hash = window.location.hash ? window.location.hash.substring(1) : "";
    if (hash) {
        activateCategory(hash);
    }
});
