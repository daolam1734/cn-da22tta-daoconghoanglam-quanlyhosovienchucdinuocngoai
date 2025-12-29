const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const handleMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const user = req.user;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống' });
        }

        // System prompt to guide Gemini's behavior
        const systemPrompt = `
            Bạn là trợ lý ảo thông minh của Hệ thống Quản lý Hồ sơ đi nước ngoài - Trường Đại học Trà Vinh (TVU).
            Tên bạn là "Trợ lý ảo TVU".
            Nhiệm vụ của bạn là hỗ trợ viên chức và quản lý trong việc:
            1. Giải đáp thắc mắc về quy trình tạo và duyệt hồ sơ đi nước ngoài.
            2. Hướng dẫn sử dụng các tính năng của hệ thống (Hồ sơ của tôi, Văn bản quy định, Báo cáo sau chuyến đi).
            3. Cung cấp thông tin cơ bản về các quy định đi nước ngoài của trường TVU.
            
            Thông tin người dùng hiện tại:
            - Họ tên: ${user.fullName || 'Viên chức'}
            - Vai trò: ${user.roles.join(', ')}
            
            Hãy trả lời ngắn gọn, lịch sự, chuyên nghiệp và luôn xưng hô là "Trợ lý ảo TVU". 
            Nếu không biết câu trả lời chính xác về quy định cụ thể, hãy khuyên người dùng liên hệ Phòng Tổ chức Nhân sự (TCNS).
        `;

        const prompt = `${systemPrompt}\n\nNgười dùng hỏi: ${message}`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({
            success: true,
            data: {
                reply: response,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống chatbot AI' });
    }
};

module.exports = {
    handleMessage
};
