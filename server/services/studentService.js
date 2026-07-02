const API_URL = "http://localhost:3001/api/students";

export const registerStudent = async (studentData) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error:", error);
    }
};