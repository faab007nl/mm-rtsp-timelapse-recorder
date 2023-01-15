const handleMainAction = (action, data) => {
    switch (action) {
        case 'init':
            alertify.notify('Ready', 'success', 2);
            break;
    }
}

export default handleMainAction;