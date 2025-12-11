import { Card, CardContent } from '@/components/ui/card';

const faculty = [
    {
        name: 'Mr. Jay-Jay Sapotalo LPT',
        title: 'Instructor',
        department: 'Computer Studies Department ',
        image: 'https://scontent.fcgy2-4.fna.fbcdn.net/v/t39.30808-6/535615191_24784254481158505_1494139912947024267_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=A6QMS3FQh_QQ7kNvwH_Qz_N&_nc_oc=AdlMBxLlhOKm4laKpuMaxSRHZRmF-rDlENqyE12XxHd3t25XmZGrzjRqdSIU5P9ODNs&_nc_zt=23&_nc_ht=scontent.fcgy2-4.fna&_nc_gid=M14NoEmpA7v3KT0Y31vPsQ&oh=00_AflMnwQG9bQv2rsQlmmzUAsOKXF-X25wzaH7GnIyZto-jw&oe=69401EE3',
        bio: 'He is committed to creating an engaging learning environment that equips students with both technical knowledge and real-world skills. Focused on innovation and digital literacy, he actively contributes to curriculum development and the growth of the department.',
    },
    {
        name: 'Mr. Rex A. Geopano',
        title: 'VP for Academic Affairs & Computer Studies Department Chairperson',
        department: 'Computer Studies Department ',
        image: 'https://scontent.fcgy2-2.fna.fbcdn.net/v/t39.30808-6/517548014_10240266617102850_6714768967122756248_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=RmkDrS58cbMQ7kNvwHaD5M5&_nc_oc=Adk8C0alKRxwy4aWLYKG6e3Z_Dnf-TybYZ4JvFdSNRvGAU3bH4hVepSl2PRF4trlnUo&_nc_zt=23&_nc_ht=scontent.fcgy2-2.fna&_nc_gid=MciG38QZrbMP6-YbRsHQ1w&oh=00_AflQIi69hR1zkYKjtoFuBHIq4jgH8h7oZId3iabst5Nfow&oe=6940223D',
        bio: 'He is dedicated to advancing academic excellence by strengthening curriculum quality and fostering a culture of continuous improvement. With his extensive experience and leadership, he guides the department toward innovation, growth, and high standards in education.',
    },
    {
        name: 'Ms. Mabelle Dumasapal',
        title: 'Instructor & CSSG Adviser',
        department: 'Computer Studies Department',
        image: 'https://scontent.fcgy2-1.fna.fbcdn.net/v/t39.30808-6/456698392_3834657880150722_1467763118280558526_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=QVVUBm3X6CIQ7kNvwEMAtsI&_nc_oc=AdnyL4FhhTkCLzI5ev7N05t1FMFGUHm5PnNjuGxv9uaQ7xpUCWFqKtz8UW7AOZTphvU&_nc_zt=23&_nc_ht=scontent.fcgy2-1.fna&_nc_gid=JhwNPH8KlKDxgbJBsFL3IA&oh=00_AflFTd1TjmWDRsO9XkzrjYM253qy3HweLhKBIga-lcwzMA&oe=6940273C',
        bio: 'She is dedicated to supporting student growth by fostering a positive and engaging learning environment. As an instructor and CSSG adviser, she actively promotes leadership, well-being, and academic excellence within the department.',
    },
    {
        name: 'Mr. Randy S. Villejo LPT',
        title: 'Instructor',
        department: 'Computer Studies Department',
        image: 'https://scontent.fcgy2-4.fna.fbcdn.net/v/t39.30808-6/469465212_562462709973596_5371487666558937510_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=_eGqLzwHEzAQ7kNvwHy7S4v&_nc_oc=AdkfY1bIdjzoeB4AkhfwIHQ55vMl6yx8DVvADuaUtLXzqHrqUlEEACWCpTv2XgUasoQ&_nc_zt=23&_nc_ht=scontent.fcgy2-4.fna&_nc_gid=GEsq1y0Ab94ua3aqmkzQgw&oh=00_AfnlY_cCJBwmrdHTHHGUzOfhm1VxaCyRLIm7YEUStD8L9w&oe=6940503B',
        bio: 'He is committed to delivering quality instruction while helping students build strong technical and practical skills. As a licensed professional teacher, he fosters an engaging classroom environment and contributes to the continuous growth of the department.',
    },
    {
        name: 'Mr. Joseph T. Aliling',
        title: 'Instructor',
        department: 'Computer Studies Department',
        image: 'https://scontent.fcgy2-1.fna.fbcdn.net/v/t39.30808-1/473823903_1652989649431836_7788580418354876986_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=102&ccb=1-7&_nc_sid=1d2534&_nc_ohc=Fufg3Reg29YQ7kNvwHBapp0&_nc_oc=AdnYrt1vMHPOXDm93LNDe_6Fnybka4CMP7_ShEME7s8a91HJXBJUSQ4Jh70-6k2LtXc&_nc_zt=24&_nc_ht=scontent.fcgy2-1.fna&_nc_gid=4neOcXeQeIcXp_nIA8D9Lg&oh=00_Afkw4YNujS4ZAgZmcIXztibV79rDavRZZ0erL_AVwH3I4A&oe=69403C52',
        bio: 'He is committed to delivering quality instruction while helping students develop strong technical and practical skills. As a licensed professional teacher, he fosters an engaging learning environment and supports the continuous growth of the Computer Studies Department.',
    },
    {
        name: 'Mr. Jimmy Teric',
        title: 'Instructor',
        department: 'Computer Studies Department',
        image: 'https://scontent.fcgy2-2.fna.fbcdn.net/v/t39.30808-6/493918967_4076270259284986_2526899942010820876_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=L6D3k5o2a0sQ7kNvwGltghZ&_nc_oc=AdlVMHEQOK2oq0PGn-osTPixuWCjTx-s1JQ9_hWIx9U61gBM4JnqnOMl1-1KQDtkQYk&_nc_zt=23&_nc_ht=scontent.fcgy2-2.fna&_nc_gid=EXaDxgdVwShuG5rvCZLrgQ&oh=00_AfnH1gAUH4GLZI3nECDGbAgS5FUE10431o7ehIWTPBECxQ&oe=6940231E',
        bio: 'He is dedicated to providing high-quality instruction while helping students build practical and technical skills. As a licensed professional teacher, he fosters an engaging learning environment and contributes to the ongoing development of the Computer Studies Department.',
    },
];

export function FacultySection() {
    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Meet Our Faculty
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Our dedicated educators bring expertise, passion, and commitment to student success.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {faculty.map((member, index) => (
                        <Card key={index} className="text-center transition-all hover:shadow-lg">
                            <CardContent className="pt-6">
                                <div className="mb-4">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-30 h-30 rounded-full object-cover mx-auto ring-4 ring-gray-100"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                                <p className="text-sm font-semibold text-gray-700 mb-1">{member.title}</p>
                                <p className="text-sm text-gray-500 mb-4">{member.department}</p>
                                <p className="text-sm text-gray-600">{member.bio}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
