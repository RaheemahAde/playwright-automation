import { test, expect, Page } from '@playwright/test';

let memberId: any;
let memberData = {
  name: 'Jack Hunter',           // Default member name 
  jobTitle: 'QA Engineer',       // Default job title
  country: 'Germany',            // Default country
  currency: 'GBP',               // Default currency
  salary: '7500',                // Default salary
  employmentType: 'contractor'   // Default employment type
};

test.describe.skip('People List', () => {
  let HrDashboardPage: any;

  test.beforeEach(async ({ page }) => {
    HrDashboardPage = new HrDashboardPage(page);
    await page.goto('http://localhost:3002/people');
    await expect(page.getByRole('heading', { name: 'People' })).toHaveText('People');
  });

  // Test 1: Create a new member with dynamic data
  test('should create a new member', async ({ page, request }) => {
    await HrDashboardPage.createMember(
      memberData.name,
      memberData.jobTitle,
      memberData.country,
      memberData.currency,
      memberData.salary,
      memberData.employmentType
    );

    const response = await request.get('http://localhost:4002/people', {
      params: { name: memberData.name },
    });

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    memberId = responseBody[0]?.id;
  });

  // Test 2: Search for the newly created member by name and edit
  test('should search members by name and edit', async () => {
    await HrDashboardPage.searchMemberByName(memberData.name);
    const updatedName = `${memberData.name} -edited`;
    const newJobTitle = 'Senior QA Engineer';
    await HrDashboardPage.editMember(memberData.name, updatedName, newJobTitle);
    
    // Update memberData to reflect the edited name and job title for subsequent tests
    memberData.name = updatedName;
    memberData.jobTitle = newJobTitle;
  });

  // Test 3: Filter member by Employee type
  test('should filter members by Employee type', async () => {
    await HrDashboardPage.filterByEmployeeType();
    await HrDashboardPage.assertMemberIsNotPresent(memberData.name);  // Member is a contractor, should not appear in the employee list
  });

  // Test 4: Filter member by Contractor type
  test('should filter members by Contractor type', async () => {
    await HrDashboardPage.filterByContractorType();
    await HrDashboardPage.assertMemberIsPresent(memberData.name); // Member is a contractor, should appear in the contractor list
  });

  // Clean up: Delete the member after all tests
  test.afterAll(async ({ request }) => {
    if (memberId) {
      const response = await request.delete(`http://localhost:4002/people/${memberId}`);
      expect(response.ok()).toBeTruthy();
    }
  });
});
