const PDFparse = require('pdf-parse');
const userModel = require('../models/userModel');
const { validateTranscript } = require('../utils/validateTranscript');
const asyncHandler = require('express-async-handler')

const exportPDF = asyncHandler(async (req, res, next) => {
    if (!req.files && !req.files.pdfFile) {
        res.status(400);
        // throw new Error('Please add req.files && req.files.pdfFile')
        throw new Error('โปรดใส่ไฟล์')
    }
    const user = await userModel.findById(req.user.id)
    if (user.role !== 'student' && user.role == 'teacher') {
        res.status(400)
        // throw new Error('User cannot to upload pdf because user has not student role')
        throw new Error('เฉพาะนักศึกษาเท่านั้น')
    }
    const result = await PDFparse(req.files.pdfFile, { max: 1 })
    if (!validateTranscript(result.text, result.info, result.metadata)) {
        res.status(400)
        // throw new Error('Transcript is not validated. Please add transcript file again.')
        throw new Error('ทรานสคริปต์ไม่ถูกต้อง โปรดใส่ใหม่')
    }
    const rawData = (result.text).split(/\n/);
    let subData = rawData.slice(15, rawData.length - 8);
    const mockData = {}
    for (let n in rawData) {
        if (rawData[n] != '' && rawData[n] != ' ') {
            let namePat = /Name Mr./, studentIDPat = /Student ID/;
            if (namePat.test(rawData[n])) {
                rawData[n] = (rawData[n].replace(namePat, '')).replace('  ', ' ');
                rawData[n] = rawData[n].split(' ');
                mockData['firstname'] = rawData[n][0];
                mockData['lastname'] = rawData[n][1];
            };
            if (studentIDPat.test(rawData[n])) {
                rawData[n] = rawData[n].split(studentIDPat);
                mockData['studentID'] = rawData[n][1].replace(' ', '');
            };
        };
    };
    if (mockData['studentID'] !== user.student_id.toString()) {
        res.status(400)
        // throw new Error('User is not owned transcript')
        throw new Error('ทรานสคริปต์ของบุคคลอื่น')
    }
    for (n in subData) {
        let semesterPat = /Semester/, gpsPat = /GPS/;
        subData[n] = subData[n].trim();
        if (semesterPat.test(subData[n])) {
            subData[n] = '';
        };
        if (gpsPat.test(subData[n])) {
            subData[n] = ('').replace('', ',');
        };
    };
    subData = subData.filter(function (value) {
        return value != '';
    });
    const data = [];
    const mapTerm = ['ปี 1 เทอม 1', 'ปี 1 เทอม 2',
        'ปี 2 เทอม 1', 'ปี 2 เทอม 2',
        'ปี 3 เทอม 1', 'ปี 3 เทอม 2',
        'ปี 4 เทอม 1', 'ปี 4 เทอม 2']
    let term_index = 0;
    subData.map(item => {
        let isnum = /^\d+$/.test(item[0]);
        if (isnum) {
            let id = item.substring(0, 8);
            const name_arr = [];
            const grade_arr = []
            let step = 0;
            for (let index = item.length - 1; index > 7; index--) {
                if (step === 0) {
                    if (/^\d+$/.test(item[index])) { step += 1; continue; }
                    grade_arr.push(item[index]);
                }
                else {
                    name_arr.push(item[index]);
                }
            }
            let name = name_arr.reverse().join("");
            name = (name.trim()).replace(/  /g, "");
            const grade = grade_arr.reverse().join("");
            data.push({ title: mapTerm[term_index], id, name, grade });
        }
        else {
            if (item[0] === ",") {
                term_index += 1;
            }
            else {
                let oldName = data.pop();
                const newName = `${oldName.name}${item}`;
                oldName.name = newName;
                data.push(oldName);
            }
        }
    })
    let lastResult = data.filter(i => i.grade !== "");
    mockData['subject'] = lastResult;
    req.extract_pdf = mockData
    next()
    // PDFparse(req.files.pdfFile, { max: 1 }).then(result => {
    //     // console.log(result);


    // });
})

module.exports = {
    exportPDF
}

