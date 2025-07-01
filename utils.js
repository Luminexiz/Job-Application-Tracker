function formatCompanyName(name) {
    if (typeof name !== 'string' || name.trim() === '') return 'Unknown Company';
    return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
}

function isValidStatus(status) {
    const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
    return validStatuses.includes(status);
}

module.exports = { formatCompanyName, isValidStatus };
