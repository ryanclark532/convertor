-- Initialize test database
USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TestDB')
BEGIN
    CREATE DATABASE TestDB;
END
GO

USE TestDB;
GO

CREATE TABLE Users (
    UserID int IDENTITY(1,1) PRIMARY KEY,
    FirstName nvarchar(50) NOT NULL,
    LastName nvarchar(50) NOT NULL,
    Email nvarchar(100) UNIQUE NOT NULL,
    DateCreated datetime2 DEFAULT GETDATE(),
    IsActive bit DEFAULT 1,
    Age int,
    Salary decimal(10,2)
);
GO

CREATE TABLE Products (
    ProductID int IDENTITY(1,1) PRIMARY KEY,
    ProductName nvarchar(100) NOT NULL,
    Category nvarchar(50),
    Price decimal(10,2) NOT NULL,
    Stock int DEFAULT 0,
    Description nvarchar(500),
    DateAdded datetime2 DEFAULT GETDATE()
);
GO

CREATE TABLE Orders (
    OrderID int IDENTITY(1,1) PRIMARY KEY,
    UserID int FOREIGN KEY REFERENCES Users(UserID),
    OrderDate datetime2 DEFAULT GETDATE(),
    TotalAmount decimal(10,2),
    Status nvarchar(20) DEFAULT 'Pending'
);
GO

CREATE TABLE OrderItems (
    OrderItemID int IDENTITY(1,1) PRIMARY KEY,
    OrderID int FOREIGN KEY REFERENCES Orders(OrderID),
    ProductID int FOREIGN KEY REFERENCES Products(ProductID),
    Quantity int NOT NULL,
    UnitPrice decimal(10,2) NOT NULL
);
GO

INSERT INTO Users (FirstName, LastName, Email, Age, Salary) VALUES
('John', 'Doe', 'john.doe@email.com', 30, 75000.00),
('Jane', 'Smith', 'jane.smith@email.com', 28, 68000.00),
('Mike', 'Johnson', 'mike.johnson@email.com', 35, 82000.00),
('Sarah', 'Wilson', 'sarah.wilson@email.com', 32, 71000.00),
('David', 'Brown', 'david.brown@email.com', 29, 65000.00),
('Emily', 'Davis', 'emily.davis@email.com', 27, 63000.00),
('Robert', 'Miller', 'robert.miller@email.com', 45, 95000.00),
('Lisa', 'Garcia', 'lisa.garcia@email.com', 31, 77000.00),
('Mark', 'Anderson', 'mark.anderson@email.com', 38, 89000.00),
('Amanda', 'Taylor', 'amanda.taylor@email.com', 26, 61000.00);
GO

INSERT INTO Products (ProductName, Category, Price, Stock, Description) VALUES
('Laptop Pro 15', 'Electronics', 1299.99, 25, 'High-performance laptop for professionals'),
('Wireless Mouse', 'Electronics', 29.99, 150, 'Ergonomic wireless mouse with precision tracking'),
('Office Chair', 'Furniture', 249.99, 45, 'Comfortable ergonomic office chair'),
('Standing Desk', 'Furniture', 399.99, 20, 'Adjustable height standing desk'),
('Mechanical Keyboard', 'Electronics', 129.99, 75, 'RGB mechanical gaming keyboard'),
('Monitor 27inch', 'Electronics', 349.99, 30, '4K resolution 27-inch monitor'),
('Desk Lamp', 'Furniture', 49.99, 60, 'LED desk lamp with adjustable brightness'),
('Webcam HD', 'Electronics', 89.99, 40, 'Full HD webcam for video conferencing'),
('Headphones', 'Electronics', 199.99, 85, 'Noise-cancelling wireless headphones'),
('Tablet 10inch', 'Electronics', 299.99, 35, 'Lightweight tablet for productivity');
GO

INSERT INTO Orders (UserID, TotalAmount, Status) VALUES
(1, 1329.98, 'Completed'),
(2, 249.99, 'Completed'),
(3, 579.98, 'Pending'),
(4, 89.99, 'Shipped'),
(5, 1949.97, 'Completed'),
(1, 79.98, 'Completed'),
(6, 399.99, 'Processing'),
(7, 649.98, 'Completed'),
(8, 159.98, 'Shipped'),
(9, 299.99, 'Pending');
GO

INSERT INTO OrderItems (OrderID, ProductID, Quantity, UnitPrice) VALUES
(1, 1, 1, 1299.99), (1, 2, 1, 29.99),
(2, 3, 1, 249.99),
(3, 4, 1, 399.99), (3, 5, 1, 129.99), (3, 7, 1, 49.99),
(4, 8, 1, 89.99),
(5, 1, 1, 1299.99), (5, 6, 1, 349.99), (5, 9, 1, 199.99), (5, 10, 1, 299.99),
(6, 2, 1, 29.99), (6, 7, 1, 49.99),
(7, 4, 1, 399.99),
(8, 6, 1, 349.99), (8, 10, 1, 299.99),
(9, 5, 1, 129.99), (9, 2, 1, 29.99),
(10, 10, 1, 299.99);
GO

CREATE PROCEDURE GetUserOrderSummary
    @UserID int
AS
BEGIN
    SELECT 
        u.FirstName + ' ' + u.LastName AS CustomerName,
        u.Email,
        COUNT(o.OrderID) AS TotalOrders,
        SUM(o.TotalAmount) AS TotalSpent,
        AVG(o.TotalAmount) AS AverageOrderValue,
        MAX(o.OrderDate) AS LastOrderDate
    FROM Users u
    LEFT JOIN Orders o ON u.UserID = o.UserID
    WHERE u.UserID = @UserID
    GROUP BY u.UserID, u.FirstName, u.LastName, u.Email;
END
GO

CREATE PROCEDURE GetProductSalesReport
    @StartDate datetime2 = NULL,
    @EndDate datetime2 = NULL
AS
BEGIN
    IF @StartDate IS NULL SET @StartDate = DATEADD(month, -1, GETDATE());
    IF @EndDate IS NULL SET @EndDate = GETDATE();
    
    SELECT 
        p.ProductName,
        p.Category,
        SUM(oi.Quantity) AS TotalQuantitySold,
        SUM(oi.Quantity * oi.UnitPrice) AS TotalRevenue,
        AVG(oi.UnitPrice) AS AveragePrice,
        COUNT(DISTINCT o.OrderID) AS NumberOfOrders
    FROM Products p
    INNER JOIN OrderItems oi ON p.ProductID = oi.ProductID
    INNER JOIN Orders o ON oi.OrderID = o.OrderID
    WHERE o.OrderDate BETWEEN @StartDate AND @EndDate
    GROUP BY p.ProductID, p.ProductName, p.Category
    ORDER BY TotalRevenue DESC;
END
GO

CREATE PROCEDURE UpdateProductStock
    @ProductID int,
    @NewStock int
AS
BEGIN
    UPDATE Products 
    SET Stock = @NewStock 
    WHERE ProductID = @ProductID;
    
    SELECT ProductID, ProductName, Stock 
    FROM Products 
    WHERE ProductID = @ProductID;
END
GO

CREATE VIEW OrderDetailsView AS
SELECT 
    o.OrderID,
    u.FirstName + ' ' + u.LastName AS CustomerName,
    u.Email,
    o.OrderDate,
    o.TotalAmount,
    o.Status,
    p.ProductName,
    oi.Quantity,
    oi.UnitPrice,
    (oi.Quantity * oi.UnitPrice) AS LineTotal
FROM Orders o
INNER JOIN Users u ON o.UserID = u.UserID
INNER JOIN OrderItems oi ON o.OrderID = oi.OrderID
INNER JOIN Products p ON oi.ProductID = p.ProductID;
GO

PRINT 'Database initialization completed successfully!';
GO