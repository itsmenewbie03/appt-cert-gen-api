type ApiResponse = {
  dns?: boolean;
  disposable: boolean;
};

const is_valid_email = async (email: string): Promise<boolean> => {
  const endpoint = `https://www.disify.com/api/email/${email}`;
  const resp = await fetch(endpoint).then((resp) => resp.json());
  const { dns, disposable } = resp as ApiResponse;
  if (!dns || disposable) {
    return false;
  }
  return true;
};

export { is_valid_email };
