export const handleMainAction = (action, data) => {
    switch (action) {
        case 'init':
            alertify.notify('Connection Ready', 'success', 2);
            break;
    }
}