const hash = async (password: string) => {
    const hashed_password = await Bun.password.hash(password, {
        algorithm: "bcrypt",
    });
    return hashed_password;
};
const compare = async (password: string, hash: string) => {
    return await Bun.password.verify(password, hash, "bcrypt");
};

export { hash, compare };
