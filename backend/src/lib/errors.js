const fail = (status, message) => Object.assign(new Error(message), {status});

export {fail};