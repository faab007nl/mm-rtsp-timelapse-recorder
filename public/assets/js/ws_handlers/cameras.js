const handleCameraAction = (action, data) => {
    console.log('handleCameraAction >', action, data);

    switch (action) {
        case 'list':
            console.log('list', data);
            break;
    }
}

export default handleCameraAction;