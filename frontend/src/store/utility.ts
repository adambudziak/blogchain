//  TODO probably redundant, consider deleting
export const updateObject = (oldObject: any, updatedProperties: any) => {
    return {
        ...oldObject,
        ...updatedProperties
    }
};

export const getUser = () => {
    const storedUser = localStorage.getItem('user');
    return (storedUser === undefined || storedUser === null)
            ? 'anonymous'
            : storedUser;
};
