export const isManagementApi = (indicator: string) =>
  /^https:\/\/[^.]+\.myeyesid\.app\/api$/.test(indicator);
