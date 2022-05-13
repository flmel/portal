/* eslint-disable jsx-a11y/label-has-associated-control */
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
// eslint-disable-next-line import/no-extraneous-dependencies
import { User } from '.prisma/client';
import Layout from '../components/layout';
import RadioButtons from '../components/RadioButtons';
import { isProfileComplete } from '../helpers/profile';
import { chooseProgramPath, indexPath } from '../helpers/paths';
import { getLoggedInUser, getSerializableUser } from '../helpers/user';
import { getFlashSession } from '../helpers/getFlashSession';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    // https://github.com/nextauthjs/next-auth/issues/4552
    const flashSession = await getFlashSession(req, res);
    flashSession.flash = 'You must be logged in to access this page.'; // TODO: use setFlashVariable
    return {
      redirect: {
        // https://stackoverflow.com/a/58182678/470749
        destination: indexPath,
        permanent: false,
      },
    };
  }

  if (await isProfileComplete(session)) {
    // (Maybe someday we'll support editing a profile, but not yet.)
    // We might want to add a session flash variable toast message here. https://stackoverflow.com/q/72206121/470749
    return {
      redirect: {
        // https://stackoverflow.com/a/58182678/470749
        destination: chooseProgramPath,
        permanent: false,
      },
    };
  }
  const user = await getLoggedInUser(session);
  const serializableUser = getSerializableUser(user);
  console.log({ serializableUser });
  const props = { user: serializableUser };
  return { props };
};

// eslint-disable-next-line max-lines-per-function
export default function ProfilePage({ user }: { user: User }) {
  // const [user, setUser] = useState<User>({} as User);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    // https://www.pluralsight.com/guides/handling-multiple-inputs-with-single-onchange-handler-react
    // https://stackoverflow.com/questions/72192566/how-fix-typescript-errors-in-react-function-that-handles-input-changes-of-multip
    console.log({ event });
    const thisField = event.target.name;
    const value = event.target.type === 'checkbox' ? (event as React.ChangeEvent<HTMLInputElement>).target.checked : event.target.value;
    console.log(thisField, value);
    // setUser({
    //   ...user,
    //   [thisField]: value,
    // });
  }

  // TODO: Add the rest of the fields from https://airtable.com/shrr8CbYRDHflkgI9 to this form.
  // TODO: Add validation, including enforcing required fields.
  return (
    <Layout>
      <form method="POST" action="/api/update-profile">
        <div>
          <label>First and Last Name</label>
          <input type="text" name="name" value={user?.name ?? undefined} className="form-control form-control-lg" onChange={handleChange} />
        </div>
        <div>
          <label>In which country do you live?</label>
          <input type="text" name="country" value={user?.country ?? undefined} className="form-control form-control-lg" onChange={handleChange} />
        </div>
        <div>
          <label>What is your time zone?</label>
          <input type="text" name="timeZone" value={user?.timeZone ?? undefined} className="form-control form-control-lg" onChange={handleChange} defaultValue="America/New_York" />
        </div>
        <div>
          <label>Software Development Experience</label>
          <div className="hint">Please share your experience writing software even if you are still a student.</div>
          <fieldset>
            <RadioButtons
              name="softwareDevelopmentExperience"
              options={{ X: 'X', Y: 'Y', Z: 'Z' }}
              currentValue={user?.softwareDevelopmentExperience}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange(event)}
            />
          </fieldset>
        </div>
        <div>
          <label>Technical Strengths</label>
          <div className="hint">Please share a list of the software languages and frameworks you are most comfortable with.</div>
          <textarea name="technicalStrengths" className="form-control form-control-lg" onChange={handleChange} />
        </div>

        <button type="submit" className="btn btn-primary">
          Continue ➔
        </button>
        <div className="hint">The next page is where you&rsquo;ll choose the program(s) to enroll in.</div>
      </form>
    </Layout>
  );
}
