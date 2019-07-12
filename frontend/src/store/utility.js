export const updateObject = (oldObject, updatedProperties) => {
    return {
        ...oldObject,
        ...updatedProperties
    }
}

export const getUser = () => {
    const storedUser = localStorage.getItem('user');
    return (storedUser === undefined || storedUser === null)
            ? 'anonymous'
            : storedUser;
}