// Importing the controller functions
const {
  registerUser,
  authUser,
  deleteUser,
  getUser,
  updateUser,
} = require("../controllers/userController");

// Mocking external dependencies
jest.mock("../models/userModel");
jest.mock("../utils/generateToken");
jest.mock(
  "express-async-handler",
  () => (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
);

const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

describe("registerUser", () => {
  // Mock request and response objects
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        pic: "pic.jpg",
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("registers a new user successfully", async () => {
    User.findOne.mockResolvedValue(null); // User does not exist
    User.create.mockResolvedValue({
      _id: "123",
      name: "Test User",
      email: "test@example.com",
      isAdmin: false,
      pic: "pic.jpg",
    });
    generateToken.mockReturnValue("fakeToken");

    await registerUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "123",
        name: "Test User",
        email: "test@example.com",
        token: "fakeToken",
      })
    );
  });

  it("returns 400 if user already exists", async () => {
    User.findOne.mockResolvedValue(true);

    await registerUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User Already Exists",
    });
  });
});

describe("authUser", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("authenticates user successfully", async () => {
    const mockUser = {
      _id: "123",
      name: "Test User",
      email: "test@example.com",
      isAdmin: false,
      pic: "pic.jpg",
      matchPassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(mockUser);
    generateToken.mockReturnValue("fakeToken");

    await authUser(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "123",
        name: "Test User",
        token: "fakeToken",
      })
    );
  });

  it("returns 400 for invalid email or password", async () => {
    User.findOne.mockResolvedValue(null); // User not found

    await authUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).not.toHaveBeenCalledWith();
  });
});

describe("deleteUser", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { user: { _id: "123" } };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it("deletes the user successfully", async () => {
    User.findByIdAndDelete.mockResolvedValue(true);

    await deleteUser(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User Account Removed",
    });
  });

  it("returns 404 if user is not found", async () => {
    User.findByIdAndDelete.mockResolvedValue(null);

    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
  });
});

describe("getUser", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { user: { _id: "123" } };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it("retrieves user information successfully", async () => {
    const userInfo = {
      _id: "123",
      name: "Test User",
      email: "test@example.com",
      isAdmin: false,
      pic: "pic.jpg",
    };
    User.findById.mockResolvedValue(userInfo);

    await getUser(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith(userInfo);
  });

  it("returns 404 if user is not found", async () => {
    User.findById.mockResolvedValue(null);

    await getUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
  });
});

describe("updateUser", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: { _id: "123" },
      body: {
        name: "Updated User",
        email: "update@example.com",
        password: "newpassword123",
        pic: "newpic.jpg",
      },
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it("updates user successfully", async () => {
    const mockUser = {
      _id: "123",
      name: "Test User",
      email: "test@example.com",
      isAdmin: false,
      pic: "pic.jpg",
      save: jest.fn().mockReturnThis(),
    };
    User.findById.mockResolvedValue(mockUser);

    await updateUser(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "123",
        name: "Updated User",
        email: "update@example.com",
        pic: "newpic.jpg",
      })
    );
  });

  it("returns 404 if user is not found", async () => {
    User.findById.mockResolvedValue(null);

    await updateUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
  });
});
