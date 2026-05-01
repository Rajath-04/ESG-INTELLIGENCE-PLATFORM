# Activity Diagrams - ESG Intelligence Platform

## 1. Admin User Management Activity Diagram

```mermaid
flowchart TD
    Start([Admin Logs In]) --> CheckAuth{Authentication<br/>Successful?}
    CheckAuth -->|No| LoginFail[Show Error Message]
    LoginFail --> End1([End])
    CheckAuth -->|Yes| Dashboard[Access Admin Dashboard]
    Dashboard --> SelectAction{Select Action}
    
    SelectAction -->|Create Admin| CreateForm[Open Create Admin Form]
    CreateForm --> EnterDetails[Enter Username and Password]
    EnterDetails --> ValidateInput{Input Valid?}
    ValidateInput -->|No| ShowError[Show Validation Error]
    ShowError --> EnterDetails
    ValidateInput -->|Yes| SubmitCreate[Submit Create Request]
    SubmitCreate --> CheckExists{Username<br/>Already Exists?}
    CheckExists -->|Yes| UserExists[Show User Exists Error]
    UserExists --> EnterDetails
    CheckExists -->|No| CreateUser[Create Admin User in Database]
    CreateUser --> ShowSuccess[Show Success Message]
    ShowSuccess --> RefreshList[Refresh User List]
    
    SelectAction -->|Delete User| SelectUser[Select User to Delete]
    SelectUser --> ConfirmDelete{Confirm<br/>Deletion?}
    ConfirmDelete -->|No| Dashboard
    ConfirmDelete -->|Yes| DeleteUser[Delete User from Database]
    DeleteUser --> RefreshList
    
    SelectAction -->|View Users| ViewList[Display User List]
    ViewList --> RefreshList
    
    RefreshList --> Dashboard
    SelectAction -->|Logout| End2([End])
    
    style Start fill:#d4edda
    style End1 fill:#f8d7da
    style End2 fill:#f8d7da
    style CheckAuth fill:#fff3cd
    style ValidateInput fill:#fff3cd
    style CheckExists fill:#fff3cd
    style ConfirmDelete fill:#fff3cd
```

## 2. Investor ESG Analysis Activity Diagram

```mermaid
flowchart TD
    Start([Investor Logs In]) --> CheckAuth{Authentication<br/>Successful?}
    CheckAuth -->|No| LoginFail[Show Error Message]
    LoginFail --> End1([End])
    CheckAuth -->|Yes| Dashboard[Access Investor Dashboard]
    
    Dashboard --> SelectAction{Select Action}
    
    SelectAction -->|Search Company| SearchForm[Enter Company Name]
    SearchForm --> FetchCompany[Fetch Company Data from Database]
    FetchCompany --> CompanyFound{Company<br/>Found?}
    CompanyFound -->|No| NoResults[Show No Results Message]
    NoResults --> Dashboard
    CompanyFound -->|Yes| ShowESG[Display ESG Scores and Metrics]
    
    ShowESG --> AnalyzeOptions{Choose Analysis Type}
    AnalyzeOptions -->|View Details| ShowDetails[Show Detailed ESG Metrics]
    ShowDetails --> Dashboard
    
    AnalyzeOptions -->|Compare Companies| SelectCompare[Select Companies to Compare]
    SelectCompare --> FetchMultiple[Fetch Multiple Company Data]
    FetchMultiple --> ShowComparison[Display Comparison Chart]
    ShowComparison --> Dashboard
    
    AnalyzeOptions -->|Generate Report| ReportType{Select<br/>Report Type}
    ReportType -->|PDF Report| GeneratePDF[Generate PDF Report]
    GeneratePDF --> DownloadPDF[Download PDF File]
    DownloadPDF --> Dashboard
    
    SelectAction -->|ESG GPT Chat| ChatInterface[Open Chat Interface]
    ChatInterface --> AskQuestion[Ask ESG Question]
    AskQuestion --> ProcessQuery[Process Query with AI]
    ProcessQuery --> ShowResponse[Display AI Response]
    ShowResponse --> MoreQuestions{Ask More<br/>Questions?}
    MoreQuestions -->|Yes| AskQuestion
    MoreQuestions -->|No| Dashboard
    
    SelectAction -->|View ESG News| FetchNews[Fetch Latest ESG News]
    FetchNews --> ShowNews[Display News Feed]
    ShowNews --> Dashboard
    
    SelectAction -->|Custom ESG Lab| CustomLab[Open Custom ESG Lab]
    CustomLab --> UploadData[Upload Custom Dataset]
    UploadData --> ProcessData[Process and Analyze Data]
    ProcessData --> ShowResults[Show Analysis Results]
    ShowResults --> Dashboard
    
    SelectAction -->|Logout| End2([End])
    
    style Start fill:#d4edda
    style End1 fill:#f8d7da
    style End2 fill:#f8d7da
    style CheckAuth fill:#fff3cd
    style CompanyFound fill:#fff3cd
    style AnalyzeOptions fill:#fff3cd
    style ReportType fill:#fff3cd
    style MoreQuestions fill:#fff3cd
```

## 3. Admin Data Management Activity Diagram

```mermaid
flowchart TD
    Start([Admin Accesses Data Management]) --> SelectTask{Select Task}
    
    SelectTask -->|Add Company| EnterCompany[Enter Company Details]
    EnterCompany --> ValidateCompany{Valid Data?}
    ValidateCompany -->|No| ShowError1[Show Validation Error]
    ShowError1 --> EnterCompany
    ValidateCompany -->|Yes| SaveCompany[Save to Database]
    SaveCompany --> Success1[Show Success Message]
    Success1 --> SelectTask
    
    SelectTask -->|Upload CSV| SelectFile[Select CSV File]
    SelectFile --> ValidateFile{Valid CSV?}
    ValidateFile -->|No| ShowError2[Show File Error]
    ShowError2 --> SelectFile
    ValidateFile -->|Yes| ProcessCSV[Process CSV Data]
    ProcessCSV --> ImportData[Import to Database]
    ImportData --> Success2[Show Import Success]
    Success2 --> SelectTask
    
    SelectTask -->|View Stats| FetchStats[Fetch System Statistics]
    FetchStats --> DisplayStats[Display Stats Dashboard]
    DisplayStats --> SelectTask
    
    SelectTask -->|Exit| End([End])
    
    style Start fill:#d4edda
    style End fill:#f8d7da
    style ValidateCompany fill:#fff3cd
    style ValidateFile fill:#fff3cd
```

## 4. User Registration Activity Diagram

```mermaid
flowchart TD
    Start([User Opens Registration]) --> SelectRole{Select Role}
    
    SelectRole -->|Investor| InvestorForm[Fill Investor Registration Form]
    SelectRole -->|Admin| AdminCheck{Admin<br/>Allowed?}
    AdminCheck -->|No| ShowRestriction[Show Admin Restriction Message]
    ShowRestriction --> End1([End])
    AdminCheck -->|Yes| AdminForm[Fill Admin Registration Form]
    
    InvestorForm --> EnterCreds1[Enter Username & Password]
    AdminForm --> EnterCreds2[Enter Username & Password]
    
    EnterCreds1 --> Validate{Validate Input}
    EnterCreds2 --> Validate
    
    Validate -->|Invalid| ShowError[Show Validation Error]
    ShowError --> SelectRole
    
    Validate -->|Valid| CheckExists{Username<br/>Exists?}
    CheckExists -->|Yes| ShowExists[Show Username Taken Error]
    ShowExists --> SelectRole
    
    CheckExists -->|No| HashPassword[Hash Password]
    HashPassword --> SaveUser[Save User to Database]
    SaveUser --> GenerateToken[Generate JWT Token]
    GenerateToken --> Success[Show Success Message]
    Success --> RedirectDash[Redirect to Dashboard]
    RedirectDash --> End2([End])
    
    style Start fill:#d4edda
    style End1 fill:#f8d7da
    style End2 fill:#d4edda
    style Validate fill:#fff3cd
    style CheckExists fill:#fff3cd
    style AdminCheck fill:#fff3cd
```

## Summary

These activity diagrams show:

1. **Admin User Management** - Create, delete, and view users
2. **Investor ESG Analysis** - Search, analyze, chat, news, and custom lab workflows
3. **Admin Data Management** - Add companies, upload CSV, view stats
4. **User Registration** - Registration flow for both investors and admins

Each diagram includes:
- ✅ Decision points (diamonds)
- ✅ Process steps (rectangles)
- ✅ Start/End points (rounded)
- ✅ Error handling flows
- ✅ Success paths
- ✅ Color coding for clarity
