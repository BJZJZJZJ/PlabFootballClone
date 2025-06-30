

function createDailyDummyDataArray(
  dateObj,
  count,
  intervalHours,
  durationMinutes,
  subFieldObjectId
) {
  const dailyMatches = [];

  // 전달받은 날짜의 시작 시간으로 설정 (시, 분, 초, 밀리초 초기화)
  const initialTime = new Date(dateObj); // Date 객체 복사
  initialTime.setHours(initialTime.getHours()); // 전달된 날짜의 시간을 유지 (기본값)
  initialTime.setMinutes(0);
  initialTime.setSeconds(0);
  initialTime.setMilliseconds(0);

  let currentStartTime = initialTime;

  for (let i = 0; i < count; i++) {
    const endTime = new Date(
      currentStartTime.getTime() + durationMinutes * 60 * 1000
    );

    dailyMatches.push({
      startTime: new Date(currentStartTime), // 현재 시간을 복사하여 사용
      endTime: endTime,
      durationMinutes: durationMinutes,
      subFieldId: subFieldObjectId,
      conditions: {
        level: "중급 이상",
        gender: "혼성",
        matchFormat: "5v5",
        theme: "풋살화",
      },
      fee: 12000,
      participantInfo: {
        minimumPlayers: 8,
        maximumPlayers: 10,
        currentPlayers: 0,
        spotsLeft: 10,
        isFull: false,
        applicationDeadlineMinutesBefore: 30,
      },
    });

    // 다음 startTime을 intervalHours 만큼 증가시킵니다.
    currentStartTime.setHours(currentStartTime.getHours() + intervalHours);
  }

  return dailyMatches;
}


async function insertDummyDataOverDays(numDays, initialStartDate, initialStartHour) {
  try {
    // 5-1. 더미 SubField 생성 또는 기존 SubField 찾기
    let targetSubField = await SubField.findOne({ name: 'Test Field 1' });

    if (!targetSubField) {
      console.log("SubField 'Test Field 1' not found. Creating a new one...");
      targetSubField = new SubField({
        name: 'Test Field 1',
        location: 'Gangwon-do, Wonju-si' // 현재 위치 기반 예시
      });
      await targetSubField.save();
      console.log('New SubField created:', targetSubField);
    } else {
      console.log("Using existing SubField:", targetSubField);
    }

    const allMatchesToInsert = [];
    const currentDay = new Date(initialStartDate); // 시작 날짜 복사

    for (let i = 0; i < numDays; i++) {
      // 해당 날짜의 시작 시간 설정
      currentDay.setHours(initialStartHour, 0, 0, 0); // 시간, 분, 초, 밀리초 설정

      // 해당 날짜에 대한 더미 매치 데이터 생성
      const dailyDummyData = createDailyDummyDataArray(currentDay, 6, 2, 90, targetSubField._id);
      allMatchesToInsert.push(...dailyDummyData); // 모든 매치 데이터를 하나의 배열에 추가

      // 다음 날짜로 이동
      currentDay.setDate(currentDay.getDate() + 1);
    }

    console.log(`Preparing to insert ${allMatchesToInsert.length} matches over ${numDays} days...`);

    // 5-2. 모든 Match 데이터 한 번에 삽입
    const savedMatches = await Match.insertMany(allMatchesToInsert);
    console.log('All dummy Match data inserted successfully!');
    console.log(`First saved match: ${savedMatches[0]._id}, Last saved match: ${savedMatches[savedMatches.length - 1]._id}`);

    // 5-3. 생성된 Match들의 _id를 SubField의 matches 배열에 추가
    const matchIds = savedMatches.map(match => match._id);
    await SubField.findByIdAndUpdate(
      targetSubField._id,
      { $addToSet: { matches: { $each: matchIds } } },
      { new: true, useFindAndModify: false }
    );
    console.log(`Successfully linked ${matchIds.length} matches to SubField: ${targetSubField.name}`);

  } catch (error) {
    console.error('Error inserting dummy data:', error);
  } finally {
    mongoose.disconnect();
  }
}

// 6. 함수 호출
// 예시: 오늘부터 14일 동안, 매일 오전 9시부터 매치 시작
const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1
const day = today.getDate().toString().padStart(2, '0');
const initialStartDate = `${year}-${month}-${day}`; // 'YYYY-MM-DD' 형식

insertDummyDataOverDays(14, initialStartDate, 9);